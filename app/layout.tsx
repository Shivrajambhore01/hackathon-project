import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Sidebar } from "@/components/layout/sidebar"
import "./globals.css"

export const metadata: Metadata = {
  title: "HealthSpeak - Medical Prescription Translation",
  description:
    "Transform complex medical prescriptions into clear, plain language instructions with AI-powered translation and voice narration.",
  generator: "HealthSpeak by Team Nexora",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <div className="flex h-screen bg-slate-900">
            <Sidebar />
            <main className="flex-1 overflow-auto ml-0 lg:ml-64 transition-all duration-300">
              <div className="min-h-full flex items-start justify-center p-4 lg:p-6">
                <div className="w-full max-w-6xl mx-auto">{children}</div>
              </div>
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
