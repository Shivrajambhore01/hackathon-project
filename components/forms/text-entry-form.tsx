"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { FileText, Loader2 } from "lucide-react"

interface TextEntryFormProps {
  onSubmit: (text: string) => void
}

export function TextEntryForm({ onSubmit }: TextEntryFormProps) {
  const [text, setText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setIsProcessing(true)
    await onSubmit(text.trim())
    setIsProcessing(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 bg-slate-800 border-slate-700">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Enter Prescription Text</h2>
          <p className="text-slate-400">Type or paste your prescription text below for instant translation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your prescription text here... (e.g., 'Tab Amoxicillin 500mg TDS p.o after meals')"
            className="min-h-32 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            disabled={isProcessing}
          />

          <Button type="submit" className="w-full" disabled={!text.trim() || isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Translate Prescription"
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}
