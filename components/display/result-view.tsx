"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pill, AlertTriangle, Utensils, Copy, Save, MessageCircle, Send } from "lucide-react"
import { VoiceControls } from "@/components/controls/voice-controls"
import { toast } from "sonner"

interface ResultViewProps {
  result: {
    plainText: string
    steps: Array<{ title: string; body: string }>
    entities?: {
      drug?: string[]
      dose?: string[]
      freq?: string[]
      route?: string[]
    }
  }
}

export function ResultView({ result }: ResultViewProps) {
  const [chatMessages, setChatMessages] = useState<Array<{ type: "user" | "ai"; content: string }>>([])
  const [chatInput, setChatInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(result.plainText)
    toast.success("Instructions copied to clipboard")
  }

  const handleSave = () => {
    toast.success("Prescription saved to history")
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages((prev) => [...prev, { type: "user", content: userMessage }])
    setIsLoading(true)

    try {
      // Simulate AI response (replace with actual AI integration)
      setTimeout(() => {
        const aiResponse = `I understand you're asking about "${userMessage}". Based on your prescription, here's what I can tell you: This is a helpful response about your medication. Always consult your doctor for specific medical advice.`
        setChatMessages((prev) => [...prev, { type: "ai", content: aiResponse }])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      toast.error("Failed to get AI response")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your HealthSpeak Explanation</h1>
          <p className="text-slate-400">
            Hello! I've reviewed your medical document and have a plain-language explanation for you. Let's start with
            your medication.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drug Usage Card */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Drug Usage</h3>
          </div>

          <div className="space-y-3">
            {result.entities?.drug && (
              <p className="text-slate-300">
                <span className="font-medium text-white">Medication:</span> {result.entities.drug.join(", ")}
              </p>
            )}
            {result.entities?.dose && (
              <p className="text-slate-300">
                <span className="font-medium text-white">Dosage:</span> {result.entities.dose.join(", ")}
              </p>
            )}
            {result.entities?.freq && (
              <p className="text-slate-300">
                <span className="font-medium text-white">Frequency:</span> {result.entities.freq.join(", ")}
              </p>
            )}
            <div className="p-3 bg-blue-600/10 rounded-lg border border-blue-600/20">
              <p className="text-blue-200 font-medium">Take one tablet daily, preferably in the morning with food.</p>
              <p className="text-blue-300 text-sm mt-1">Try to take it around the same time each day.</p>
            </div>
          </div>
        </Card>

        {/* Side Effects Card */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Potential Side Effects</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-slate-300 mb-2">Common (usually mild):</p>
              <ul className="text-sm text-slate-400 space-y-1 ml-4">
                <li>• Dizziness</li>
                <li>• Fatigue</li>
                <li>• Dry cough</li>
              </ul>
            </div>

            <div className="p-3 bg-red-600/10 rounded-lg border border-red-600/20">
              <p className="text-red-200 font-medium mb-1">Severe (contact doctor):</p>
              <ul className="text-red-300 text-sm space-y-1">
                <li>• Chest pain</li>
                <li>• Irregular heartbeat</li>
                <li>• Swelling in ankles or feet</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Dietary Restrictions Card */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Utensils className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Dietary Restrictions</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-orange-600/10 rounded-lg border border-orange-600/20">
              <p className="text-orange-200 font-medium mb-1">Avoid:</p>
              <ul className="text-orange-300 text-sm space-y-1">
                <li>• Grapefruit and grapefruit juice</li>
                <li>• High-sodium foods</li>
              </ul>
            </div>

            <div>
              <p className="text-slate-300 mb-2">General advice:</p>
              <ul className="text-sm text-slate-400 space-y-1 ml-4">
                <li>• Maintain a balanced diet</li>
                <li>• Reduce sodium intake</li>
                <li>• Check before eating new foods</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Voice Controls */}
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Listen to Instructions</h3>
        <VoiceControls text={result.plainText} />
      </Card>

      {/* Chat Interface */}
      <Card className="p-6 bg-slate-800 border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Ask Questions</h3>
        </div>

        {/* Chat Messages */}
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {chatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === "user" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-200"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-200 px-4 py-2 rounded-lg">AI is typing...</div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleChatSubmit} className="flex space-x-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask further questions about your prescription, medication, or health..."
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  )
}
