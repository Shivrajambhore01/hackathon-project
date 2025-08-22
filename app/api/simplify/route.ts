import { NextResponse } from "next/server"
import { simplifyText } from "@/lib/simplify"

export async function POST(req: Request) {
  try {
    const { rawText } = await req.json()

    if (!rawText) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const result = simplifyText(rawText)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Simplification error:", error)
    return NextResponse.json({ error: "Simplification failed" }, { status: 500 })
  }
}
