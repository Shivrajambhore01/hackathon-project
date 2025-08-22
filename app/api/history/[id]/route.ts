import { NextResponse } from "next/server"
import { deleteHistoryItem } from "@/lib/db-history"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const success = deleteHistoryItem(id)

    if (success) {
      return NextResponse.json({ message: "Item deleted successfully" })
    } else {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Delete history error:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
