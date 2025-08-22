"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, History, User, Settings, Menu, X, Bell, Clock, Info, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Translate", href: "/translate", icon: FileText },
  { name: "History", href: "/history", icon: History },
  { name: "Reminders", href: "/reminders", icon: Bell }, // Added reminders navigation
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "About", href: "/about", icon: Info }, // Added About to navigation
  { name: "Sign In", href: "/signin", icon: LogIn }, // Added Sign In to navigation
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-slate-800 border-slate-700 hover:bg-slate-700"
        >
          {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 transition-transform shadow-xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center space-x-3 p-6 border-b border-slate-700">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">HealthSpeak</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-md",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 transition-transform duration-200",
                          !isActive && "group-hover:scale-110",
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Quick Stats */}
          <div className="p-4 border-t border-slate-700">
            <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span>Today's Reminders</span>
                <Clock className="w-3 h-3" />
              </div>
              <div className="text-lg font-semibold text-white">3 pending</div>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Guest User</p>
                <p className="text-xs text-slate-400 truncate">guest@healthspeak.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
