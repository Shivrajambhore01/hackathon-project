import { NextResponse } from "next/server"
import { getHistoryStats } from "@/lib/db-history"

export async function GET() {
  try {
    const stats = getHistoryStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Get history stats error:", error)
    return NextResponse.json({ error: "Failed to get statistics" }, { status: 500 })
  }
}
