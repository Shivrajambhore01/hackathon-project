import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, Award, Heart, Shield, Zap } from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: FileText,
      title: "AI-Powered Translation",
      description: "Advanced OCR and NLP technology converts complex medical jargon into plain language",
    },
    {
      icon: Heart,
      title: "Patient-Centered",
      description: "Designed to improve health literacy and medication adherence for better outcomes",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your medical information is processed securely with end-to-end encryption",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get simplified explanations in seconds with voice narration support",
    },
  ]

  const teamMembers = [
    { name: "Santosh Donapurge", role: "Team Leader", college: "JDCOEM" },
    { name: "Rushang Chandekar", role: "Frontend Developer", college: "JDCOEM" },
    { name: "Shivam Naredi", role: "AI Engineer", college: "JDCOEM" },
    { name: "Shivraj Ambhore", role: "Backend Developer", college: "JDCOEM" },
    { name: "Sargun Singh Bhatia", role: "Voice & Testing", college: "JDCOEM" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">HealthSpeak</h1>
        </div>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Transforming complex medical prescriptions into clear, understandable instructions that empower patients to
          take control of their health.
        </p>
        <div className="flex items-center justify-center space-x-2">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            Hackathon Project
          </Badge>
          <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
            Team Nexora
          </Badge>
        </div>
      </div>

      {/* Problem Statement */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-400" />
            <span>The Problem We're Solving</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-4">
          <p>
            Far too often, patients are handed prescriptions filled with complex medical jargon and cryptic
            abbreviations. Most people, especially those with limited health literacy, find this language confusing and
            intimidating.
          </p>
          <p>
            This confusion leads to medication errors, missed treatments, and preventable hospital readmissions.
            Vulnerable groups like seniors and rural communities are at even greater risk.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-blue-400" />
                </div>
                <span>{feature.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tech Stack */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Technology Stack</CardTitle>
          <CardDescription>Built with modern, reliable technologies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-blue-400 font-bold">React</span>
              </div>
              <p className="text-sm text-slate-300">Frontend</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-green-400 font-bold">AI</span>
              </div>
              <p className="text-sm text-slate-300">OCR & NLP</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-purple-400 font-bold">TTS</span>
              </div>
              <p className="text-sm text-slate-300">Voice</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-orange-400 font-bold">API</span>
              </div>
              <p className="text-sm text-slate-300">Backend</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Meet Team Nexora</span>
          </CardTitle>
          <CardDescription>JDCOEM students passionate about healthcare innovation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-white font-semibold">{member.name}</h3>
                <p className="text-blue-400 text-sm">{member.role}</p>
                <p className="text-slate-400 text-xs">{member.college}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span>Our Impact</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-4">
          <p>
            HealthSpeak aims to bridge the gap between complex medical language and patient understanding, ultimately
            improving medication adherence and health outcomes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">95%</div>
              <div className="text-sm text-slate-400">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">3s</div>
              <div className="text-sm text-slate-400">Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-sm text-slate-400">Availability</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
