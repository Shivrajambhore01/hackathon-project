"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Brain, Mic, Shield, Database, Zap, TestTube } from "lucide-react"
import { toast } from "sonner"

interface SettingsData {
  // AI Model Settings
  aiProvider: string
  ocrProvider: string
  confidenceThreshold: number
  enableAdvancedNER: boolean
  demoMode: boolean

  // Voice Settings
  voiceEnabled: boolean
  voiceRate: number
  voicePitch: number
  preferredVoice: string

  // UI Settings
  fontSize: number
  highContrast: boolean
  language: string
  autoSave: boolean

  // API Keys
  openaiKey: string
  googleVisionKey: string
  azureKey: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    aiProvider: "openai",
    ocrProvider: "mock",
    confidenceThreshold: 0.8,
    enableAdvancedNER: true,
    demoMode: true,
    voiceEnabled: true,
    voiceRate: 1,
    voicePitch: 1,
    preferredVoice: "default",
    fontSize: 16,
    highContrast: false,
    language: "en",
    autoSave: true,
    openaiKey: "",
    googleVisionKey: "",
    azureKey: "",
  })

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("healthspeak-settings")
    if (saved) {
      setSettings({ ...settings, ...JSON.parse(saved) })
    }

    // Load available voices
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      setAvailableVoices(voices)
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  const saveSettings = () => {
    localStorage.setItem("healthspeak-settings", JSON.stringify(settings))
    toast.success("Settings saved successfully!")
  }

  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance("This is a test of your voice settings.")
    utterance.rate = settings.voiceRate
    utterance.pitch = settings.voicePitch

    if (settings.preferredVoice !== "default") {
      const voice = availableVoices.find((v) => v.name === settings.preferredVoice)
      if (voice) utterance.voice = voice
    }

    speechSynthesis.speak(utterance)
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Settings className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400">Configure your HealthSpeak experience</p>
          </div>
        </div>

        <Tabs defaultValue="ai" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="ai" className="data-[state=active]:bg-blue-600">
              <Brain className="w-4 h-4 mr-2" />
              AI Models
            </TabsTrigger>
            <TabsTrigger value="voice" className="data-[state=active]:bg-blue-600">
              <Mic className="w-4 h-4 mr-2" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="interface" className="data-[state=active]:bg-blue-600">
              <Settings className="w-4 h-4 mr-2" />
              Interface
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-6">
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TestTube className="w-5 h-5 mr-2 text-green-400" />
                  Demo Mode
                  <Badge className="ml-2 bg-green-600">Active</Badge>
                </CardTitle>
                <CardDescription>Experience HealthSpeak without API keys using realistic mock data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Enable Demo Mode</Label>
                    <p className="text-sm text-slate-400">Use mock AI responses and sample prescriptions for testing</p>
                  </div>
                  <Switch
                    checked={settings.demoMode}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        demoMode: checked,
                        ocrProvider: checked ? "mock" : "google-vision",
                      })
                      if (checked) {
                        toast.success("Demo mode enabled - no API keys required!")
                      }
                    }}
                  />
                </div>
                {settings.demoMode && (
                  <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                    <p className="text-sm text-green-300">
                      ✓ Demo mode is active. Upload any image to see realistic medical prescription translations without
                      requiring API keys.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-400" />
                  AI Model Configuration
                </CardTitle>
                <CardDescription>Configure AI providers for optimal medical text processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ai-provider" className="text-white">
                      AI Text Processing
                    </Label>
                    <Select
                      value={settings.aiProvider}
                      onValueChange={(value) => setSettings({ ...settings, aiProvider: value })}
                      disabled={settings.demoMode}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            OpenAI GPT-4 <Badge className="ml-2">Recommended</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                        <SelectItem value="huggingface">Hugging Face Medical</SelectItem>
                        <SelectItem value="local">Local Model</SelectItem>
                      </SelectContent>
                    </Select>
                    {settings.demoMode && <p className="text-xs text-yellow-400">Disabled in demo mode</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ocr-provider" className="text-white">
                      OCR Provider
                    </Label>
                    <Select
                      value={settings.ocrProvider}
                      onValueChange={(value) => setSettings({ ...settings, ocrProvider: value })}
                      disabled={settings.demoMode}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mock">
                          <div className="flex items-center">
                            <TestTube className="w-4 h-4 mr-2" />
                            Demo Mode <Badge className="ml-2 bg-green-600">Free</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="google-vision">
                          <div className="flex items-center">
                            <Database className="w-4 h-4 mr-2" />
                            Google Vision API <Badge className="ml-2">Best Accuracy</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="azure-vision">Azure Computer Vision</SelectItem>
                        <SelectItem value="aws-textract">AWS Textract</SelectItem>
                        <SelectItem value="tesseract">Tesseract (Free)</SelectItem>
                      </SelectContent>
                    </Select>
                    {settings.demoMode && <p className="text-xs text-yellow-400">Using mock OCR in demo mode</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Confidence Threshold: {settings.confidenceThreshold}</Label>
                  <Slider
                    value={[settings.confidenceThreshold]}
                    onValueChange={([value]) => setSettings({ ...settings, confidenceThreshold: value })}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-sm text-slate-400">Higher values require more confidence in AI predictions</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Advanced Medical NER</Label>
                    <p className="text-sm text-slate-400">Use specialized medical entity recognition models</p>
                  </div>
                  <Switch
                    checked={settings.enableAdvancedNER}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableAdvancedNER: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Mic className="w-5 h-5 mr-2 text-blue-400" />
                  Voice Settings
                </CardTitle>
                <CardDescription>Customize text-to-speech preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Enable Voice Narration</Label>
                    <p className="text-sm text-slate-400">Read prescription instructions aloud</p>
                  </div>
                  <Switch
                    checked={settings.voiceEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, voiceEnabled: checked })}
                  />
                </div>

                {settings.voiceEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-white">Preferred Voice</Label>
                      <Select
                        value={settings.preferredVoice}
                        onValueChange={(value) => setSettings({ ...settings, preferredVoice: value })}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">System Default</SelectItem>
                          {availableVoices.map((voice) => (
                            <SelectItem key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white">Speech Rate: {settings.voiceRate}</Label>
                        <Slider
                          value={[settings.voiceRate]}
                          onValueChange={([value]) => setSettings({ ...settings, voiceRate: value })}
                          max={2}
                          min={0.5}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Speech Pitch: {settings.voicePitch}</Label>
                        <Slider
                          value={[settings.voicePitch]}
                          onValueChange={([value]) => setSettings({ ...settings, voicePitch: value })}
                          max={2}
                          min={0.5}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <Button onClick={testVoice} variant="outline" className="w-full bg-transparent">
                      Test Voice Settings
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interface" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Interface Preferences</CardTitle>
                <CardDescription>Customize the user interface for better accessibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => setSettings({ ...settings, language: value })}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Font Size: {settings.fontSize}px</Label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([value]) => setSettings({ ...settings, fontSize: value })}
                      max={24}
                      min={12}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">High Contrast Mode</Label>
                    <p className="text-sm text-slate-400">Improve visibility for better accessibility</p>
                  </div>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => setSettings({ ...settings, highContrast: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Auto-save Results</Label>
                    <p className="text-sm text-slate-400">Automatically save translations to history</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-400" />
                  API Keys & Security
                </CardTitle>
                <CardDescription>Configure API keys for enhanced AI processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings.demoMode && (
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                    <h4 className="text-green-300 font-medium mb-2">Demo Mode Active</h4>
                    <p className="text-sm text-green-200">
                      API keys are not required in demo mode. Disable demo mode above to configure real API keys.
                    </p>
                  </div>
                )}

                <div className="space-y-4" style={{ opacity: settings.demoMode ? 0.5 : 1 }}>
                  <div className="space-y-2">
                    <Label htmlFor="openai-key" className="text-white">
                      OpenAI API Key
                    </Label>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      value={settings.openaiKey}
                      onChange={(e) => setSettings({ ...settings, openaiKey: e.target.value })}
                      className="bg-slate-700 border-slate-600"
                      disabled={settings.demoMode}
                    />
                    <p className="text-sm text-slate-400">Required for GPT-4 powered medical text processing</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-key" className="text-white">
                      Google Vision API Key
                    </Label>
                    <Input
                      id="google-key"
                      type="password"
                      placeholder="AIza..."
                      value={settings.googleVisionKey}
                      onChange={(e) => setSettings({ ...settings, googleVisionKey: e.target.value })}
                      className="bg-slate-700 border-slate-600"
                      disabled={settings.demoMode}
                    />
                    <p className="text-sm text-slate-400">Required for high-accuracy OCR processing</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="azure-key" className="text-white">
                      Azure Cognitive Services Key
                    </Label>
                    <Input
                      id="azure-key"
                      type="password"
                      placeholder="..."
                      value={settings.azureKey}
                      onChange={(e) => setSettings({ ...settings, azureKey: e.target.value })}
                      className="bg-slate-700 border-slate-600"
                      disabled={settings.demoMode}
                    />
                    <p className="text-sm text-slate-400">Optional: For Azure-based AI services</p>
                  </div>
                </div>

                {!settings.demoMode && (
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Security Notice</h4>
                    <p className="text-sm text-slate-400">
                      API keys are stored locally in your browser and never sent to our servers. They are only used to
                      make direct API calls to the respective services.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
