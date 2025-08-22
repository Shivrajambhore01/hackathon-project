import { NextResponse } from "next/server"
import { searchHistory } from "@/lib/db-history"

export async function POST(request: Request) {
  try {
    const { query, filters } = await request.json()
    const results = searchHistory(query, filters)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Search history error:", error)
    return NextResponse.json({ error: "Failed to search history" }, { status: 500 })
  }
}
