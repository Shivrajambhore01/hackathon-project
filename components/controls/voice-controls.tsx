"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { speak, stopSpeaking, getVoices } from "@/lib/tts"

interface VoiceControlsProps {
  text: string
  defaultRate?: number
  defaultPitch?: number
}

export function VoiceControls({ text, defaultRate = 1, defaultPitch = 1 }: VoiceControlsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [rate, setRate] = useState(defaultRate)
  const [pitch, setPitch] = useState(defaultPitch)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = getVoices()
      setVoices(availableVoices)
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name)
      }
    }

    loadVoices()
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [selectedVoice])

  const handlePlay = () => {
    speak(text, { rate, pitch, voice: selectedVoice })
    setIsSpeaking(true)

    // Listen for speech end
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setIsSpeaking(false)
  }

  const handlePause = () => {
    stopSpeaking()
    setIsSpeaking(false)
  }

  return (
    <div className="space-y-4">
      {/* Play/Pause Controls */}
      <div className="flex items-center space-x-4">
        {isSpeaking ? (
          <Button onClick={handlePause} className="bg-red-600 hover:bg-red-700">
            <Pause className="w-4 h-4 mr-2" />
            Stop
          </Button>
        ) : (
          <Button onClick={handlePlay} className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Play
          </Button>
        )}

        <div className="flex items-center space-x-2 text-slate-400">
          <Volume2 className="w-4 h-4" />
          <span className="text-sm">Voice narration available</span>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-700/50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Speech Rate: {rate.toFixed(1)}x</label>
          <Slider
            value={[rate]}
            onValueChange={(value) => setRate(value[0])}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Pitch: {pitch.toFixed(1)}</label>
          <Slider
            value={[pitch]}
            onValueChange={(value) => setPitch(value[0])}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
