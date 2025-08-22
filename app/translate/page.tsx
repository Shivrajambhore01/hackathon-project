"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ResultView } from "@/components/display/result-view"
import { TextEntryForm } from "@/components/forms/text-entry-form"

export default function TranslatePage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")
  const [result, setResult] = useState(null)
  const [startTime, setStartTime] = useState(Date.now())

  useEffect(() => {
    // Check for stored result from upload
    const storedResult = sessionStorage.getItem("prescriptionResult")
    if (storedResult) {
      setResult(JSON.parse(storedResult))
      sessionStorage.removeItem("prescriptionResult")
    }
  }, [])

  const handleTextSubmit = async (text: string) => {
    try {
      const response = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text }),
      })

      if (!response.ok) throw new Error("Simplification failed")
      const result = await response.json()

      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: text,
          simplifiedText: result.plainText,
          filename: "Manual Entry",
          entities: result.entities,
          processingTime: Date.now() - startTime,
        }),
      })

      setResult(result)
    } catch (error) {
      console.error("Text processing error:", error)
    }
  }

  return (
    <>
      {result ? (
        <ResultView result={result} />
      ) : mode === "text" ? (
        <TextEntryForm onSubmit={handleTextSubmit} />
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">No prescription to display</h2>
          <p className="text-slate-400">Upload a document or enter text to get started.</p>
        </div>
      )}
    </>
  )
}
