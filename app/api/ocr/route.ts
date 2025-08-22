import { NextResponse } from "next/server"
import { extractTextFromImage } from "@/lib/ocr"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      return NextResponse.json({ error: "File too large" }, { status: 413 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await extractTextFromImage(buffer)

    return NextResponse.json({ text })
  } catch (error) {
    console.error("OCR error:", error)
    return NextResponse.json({ error: "OCR processing failed" }, { status: 500 })
  }
}
