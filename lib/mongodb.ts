import { MongoClient, type Db, type Collection } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Database and collection interfaces
export interface HistoryItem {
  _id?: string
  userId?: string
  originalText: string
  simplifiedText: string
  entities?: {
    drug?: string[]
    dose?: string[]
    route?: string[]
    freq?: string[]
  }
  tags: string[]
  category: string
  processingTime: number
  filename?: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  _id?: string
  email: string
  name: string
  createdAt: Date
  preferences: {
    language: string
    voiceRate: number
    voicePitch: number
    theme: string
  }
}

export interface Reminder {
  _id?: string
  userId: string
  medicationName: string
  dosage: string
  frequency: string
  times: string[]
  startDate: Date
  endDate?: Date
  isActive: boolean
  createdAt: Date
}

class DatabaseManager {
  private client: Promise<MongoClient>
  private dbName = "healthspeak"

  constructor() {
    this.client = clientPromise
  }

  private async getDb(): Promise<Db> {
    const client = await this.client
    return client.db(this.dbName)
  }

  // History operations
  async getHistoryCollection(): Promise<Collection<HistoryItem>> {
    const db = await this.getDb()
    return db.collection<HistoryItem>("history")
  }

  async addHistoryItem(item: Omit<HistoryItem, "_id" | "createdAt" | "updatedAt">): Promise<string> {
    const collection = await this.getHistoryCollection()
    const result = await collection.insertOne({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return result.insertedId.toString()
  }

  async getHistory(userId?: string, limit = 50, skip = 0): Promise<HistoryItem[]> {
    const collection = await this.getHistoryCollection()
    const query = userId ? { userId } : {}
    return await collection.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip).toArray()
  }

  async getHistoryById(id: string): Promise<HistoryItem | null> {
    const collection = await this.getHistoryCollection()
    return await collection.findOne({ _id: id as any })
  }

  async deleteHistoryItem(id: string): Promise<boolean> {
    const collection = await this.getHistoryCollection()
    const result = await collection.deleteOne({ _id: id as any })
    return result.deletedCount > 0
  }

  async searchHistory(query: string, userId?: string): Promise<HistoryItem[]> {
    const collection = await this.getHistoryCollection()
    const searchQuery: any = {
      $or: [
        { originalText: { $regex: query, $options: "i" } },
        { simplifiedText: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
        { category: { $regex: query, $options: "i" } },
      ],
    }

    if (userId) {
      searchQuery.userId = userId
    }

    return await collection.find(searchQuery).sort({ createdAt: -1 }).toArray()
  }

  async getHistoryStats(userId?: string): Promise<{
    total: number
    thisMonth: number
    categories: { [key: string]: number }
    avgProcessingTime: number
  }> {
    const collection = await this.getHistoryCollection()
    const query = userId ? { userId } : {}

    const total = await collection.countDocuments(query)

    const thisMonth = await collection.countDocuments({
      ...query,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    })

    const categoryStats = await collection
      .aggregate([{ $match: query }, { $group: { _id: "$category", count: { $sum: 1 } } }])
      .toArray()

    const categories = categoryStats.reduce(
      (acc, item) => {
        acc[item._id] = item.count
        return acc
      },
      {} as { [key: string]: number },
    )

    const avgProcessingTimeResult = await collection
      .aggregate([{ $match: query }, { $group: { _id: null, avgTime: { $avg: "$processingTime" } } }])
      .toArray()

    const avgProcessingTime = avgProcessingTimeResult[0]?.avgTime || 0

    return { total, thisMonth, categories, avgProcessingTime }
  }

  // User operations
  async getUsersCollection(): Promise<Collection<User>> {
    const db = await this.getDb()
    return db.collection<User>("users")
  }

  async createUser(user: Omit<User, "_id" | "createdAt">): Promise<string> {
    const collection = await this.getUsersCollection()
    const result = await collection.insertOne({
      ...user,
      createdAt: new Date(),
    })
    return result.insertedId.toString()
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const collection = await this.getUsersCollection()
    return await collection.findOne({ email })
  }

  // Reminder operations
  async getRemindersCollection(): Promise<Collection<Reminder>> {
    const db = await this.getDb()
    return db.collection<Reminder>("reminders")
  }

  async addReminder(reminder: Omit<Reminder, "_id" | "createdAt">): Promise<string> {
    const collection = await this.getRemindersCollection()
    const result = await collection.insertOne({
      ...reminder,
      createdAt: new Date(),
    })
    return result.insertedId.toString()
  }

  async getReminders(userId: string): Promise<Reminder[]> {
    const collection = await this.getRemindersCollection()
    return await collection.find({ userId, isActive: true }).sort({ createdAt: -1 }).toArray()
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<boolean> {
    const collection = await this.getRemindersCollection()
    const result = await collection.updateOne({ _id: id as any }, { $set: updates })
    return result.modifiedCount > 0
  }

  async deleteReminder(id: string): Promise<boolean> {
    const collection = await this.getRemindersCollection()
    const result = await collection.deleteOne({ _id: id as any })
    return result.deletedCount > 0
  }
}

export const db = new DatabaseManager()
export default clientPromise
