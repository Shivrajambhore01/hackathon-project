"use client"

import { useState } from "react"
import { Upload, Camera, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUpload } from "@/components/forms/file-upload"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function HomePage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    try {
      // OCR Processing
      const formData = new FormData()
      formData.append("file", file)

      const ocrResponse = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      if (!ocrResponse.ok) throw new Error("OCR failed")
      const { text } = await ocrResponse.json()

      // AI Simplification
      const simplifyResponse = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text }),
      })

      if (!simplifyResponse.ok) throw new Error("Simplification failed")
      const result = await simplifyResponse.json()

      // Save to history
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          simplified: result.plainText,
          filename: file.name,
          result,
        }),
      })

      // Navigate to results with data
      sessionStorage.setItem("prescriptionResult", JSON.stringify(result))
      router.push("/translate")
    } catch (error) {
      toast.error("Failed to process prescription. Please try again.")
      console.error("Processing error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleScanDocument = () => {
    toast.info("Camera scanning feature coming soon!")
  }

  const handleEnterText = () => {
    router.push("/translate?mode=text")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">HealthSpeak</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#about" className="text-slate-300 hover:text-white transition-colors">
                About
              </a>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Translate Your Document</h1>
          <p className="text-xl text-slate-300 mb-8">
            Get a plain language version of your medical records in seconds.
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <FileUpload onFileSelect={handleFileUpload} isProcessing={isProcessing} />

            {/* Alternative Methods */}
            <div className="mt-8 pt-8 border-t border-slate-700">
              <p className="text-sm text-slate-400 text-center mb-6">Or choose another method</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleScanDocument}
                  className="h-16 border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 bg-transparent"
                >
                  <Camera className="w-6 h-6 mr-3" />
                  Scan Document
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleEnterText}
                  className="h-16 border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 bg-transparent"
                >
                  <FileText className="w-6 h-6 mr-3" />
                  Enter Text
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why HealthSpeak?</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Transform confusing medical jargon into clear, actionable instructions that anyone can understand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-slate-800/30 border-slate-700">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant Translation</h3>
              <p className="text-slate-300">
                Advanced OCR and AI instantly convert complex prescriptions into plain language.
              </p>
            </Card>

            <Card className="p-6 bg-slate-800/30 border-slate-700">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Voice Narration</h3>
              <p className="text-slate-300">
                Listen to your prescription instructions with built-in text-to-speech technology.
              </p>
            </Card>

            <Card className="p-6 bg-slate-800/30 border-slate-700">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Multiple Formats</h3>
              <p className="text-slate-300">Upload images, PDFs, or scan documents directly with your camera.</p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-300">HealthSpeak by Team Nexora</span>
            </div>
            <div className="flex space-x-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
