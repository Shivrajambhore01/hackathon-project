import { db, type HistoryItem } from "./mongodb"

export { HistoryItem } from "./mongodb"

export async function getHistory(userId?: string, limit = 50, skip = 0): Promise<HistoryItem[]> {
  try {
    return await db.getHistory(userId, limit, skip)
  } catch (error) {
    console.error("Error reading history:", error)
    return []
  }
}

export async function addHistory(item: Omit<HistoryItem, "_id" | "createdAt" | "updatedAt">): Promise<string | null> {
  try {
    // Auto-generate tags and category if not provided
    if (!item.tags) {
      item.tags = generateTags(item.originalText, item.simplifiedText)
    }

    if (!item.category) {
      item.category = categorizeContent(item.originalText)
    }

    return await db.addHistoryItem(item)
  } catch (error) {
    console.error("Error saving history:", error)
    return null
  }
}

export async function deleteHistoryItem(id: string): Promise<boolean> {
  try {
    return await db.deleteHistoryItem(id)
  } catch (error) {
    console.error("Error deleting history item:", error)
    return false
  }
}

export async function searchHistory(query: string, userId?: string): Promise<HistoryItem[]> {
  try {
    return await db.searchHistory(query, userId)
  } catch (error) {
    console.error("Error searching history:", error)
    return []
  }
}

export async function getHistoryStats(userId?: string) {
  try {
    return await db.getHistoryStats(userId)
  } catch (error) {
    console.error("Error getting history stats:", error)
    return {
      total: 0,
      thisMonth: 0,
      categories: {},
      avgProcessingTime: 0,
    }
  }
}

export async function getHistoryById(id: string): Promise<HistoryItem | null> {
  try {
    return await db.getHistoryById(id)
  } catch (error) {
    console.error("Error getting history item:", error)
    return null
  }
}

function generateTags(originalText: string, simplifiedText: string): string[] {
  const tags: string[] = []
  const text = (originalText + " " + simplifiedText).toLowerCase()

  // Medical categories
  if (text.includes("antibiotic") || text.includes("amoxicillin") || text.includes("penicillin")) {
    tags.push("antibiotic")
  }
  if (text.includes("pain") || text.includes("analgesic") || text.includes("ibuprofen")) {
    tags.push("pain-relief")
  }
  if (text.includes("blood pressure") || text.includes("hypertension")) {
    tags.push("blood-pressure")
  }
  if (text.includes("diabetes") || text.includes("insulin") || text.includes("glucose")) {
    tags.push("diabetes")
  }
  if (text.includes("heart") || text.includes("cardiac")) {
    tags.push("cardiac")
  }

  // Frequency tags
  if (text.includes("daily") || text.includes("od") || text.includes("once")) {
    tags.push("daily")
  }
  if (text.includes("twice") || text.includes("bd") || text.includes("bid")) {
    tags.push("twice-daily")
  }
  if (text.includes("three times") || text.includes("tds") || text.includes("tid")) {
    tags.push("three-times-daily")
  }

  return tags
}

function categorizeContent(text: string): string {
  const lowerText = text.toLowerCase()

  if (lowerText.includes("antibiotic") || lowerText.includes("infection")) {
    return "Antibiotics"
  }
  if (lowerText.includes("pain") || lowerText.includes("analgesic")) {
    return "Pain Management"
  }
  if (lowerText.includes("blood pressure") || lowerText.includes("hypertension")) {
    return "Cardiovascular"
  }
  if (lowerText.includes("diabetes") || lowerText.includes("insulin")) {
    return "Diabetes"
  }
  if (lowerText.includes("vitamin") || lowerText.includes("supplement")) {
    return "Supplements"
  }
  if (lowerText.includes("cream") || lowerText.includes("ointment") || lowerText.includes("topical")) {
    return "Topical"
  }

  return "General"
}
