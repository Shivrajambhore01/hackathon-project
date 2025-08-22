import { NextResponse } from "next/server"
import { getHistory, addHistory } from "@/lib/db-history"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") || undefined
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    const history = await getHistory(userId, limit, skip)
    return NextResponse.json(history)
  } catch (error) {
    console.error("History fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { originalText, simplifiedText, filename, entities, userId, processingTime } = await req.json()

    if (!originalText || !simplifiedText) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const historyItem = {
      userId,
      originalText,
      simplifiedText,
      entities,
      filename: filename || "Unknown",
      processingTime: processingTime || 0,
      tags: [], // Will be auto-generated in addHistory
      category: "", // Will be auto-generated in addHistory
    }

    const id = await addHistory(historyItem)

    if (!id) {
      return NextResponse.json({ error: "Failed to save to history" }, { status: 500 })
    }

    return NextResponse.json({ id, ...historyItem, createdAt: new Date() })
  } catch (error) {
    console.error("History save error:", error)
    return NextResponse.json({ error: "Failed to save to history" }, { status: 500 })
  }
}
