"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, Plus, Trash2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface Reminder {
  id: string
  medicineName: string
  dosage: string
  frequency: string
  times: string[]
  notes: string
  isActive: boolean
  createdAt: string
  nextDue: string
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    medicineName: "",
    dosage: "",
    frequency: "daily",
    times: ["09:00"],
    notes: "",
    isActive: true,
  })

  // Load reminders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("healthspeak-reminders")
    if (saved) {
      setReminders(JSON.parse(saved))
    }
  }, [])

  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem("healthspeak-reminders", JSON.stringify(reminders))
  }, [reminders])

  // Check for due reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 5)

      reminders.forEach((reminder) => {
        if (reminder.isActive && reminder.times.includes(currentTime)) {
          // Show notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`Time for ${reminder.medicineName}`, {
              body: `Take ${reminder.dosage} - ${reminder.notes}`,
              icon: "/favicon.ico",
            })
          }
          toast.success(`Time for ${reminder.medicineName}`, {
            description: `Take ${reminder.dosage}`,
          })
        }
      })
    }

    const interval = setInterval(checkReminders, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [reminders])

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const addReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      nextDue: calculateNextDue(formData.times[0]),
    }

    setReminders([...reminders, newReminder])
    setFormData({
      medicineName: "",
      dosage: "",
      frequency: "daily",
      times: ["09:00"],
      notes: "",
      isActive: true,
    })
    setShowAddForm(false)
    toast.success("Reminder added successfully!")
  }

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id))
    toast.success("Reminder deleted")
  }

  const toggleReminder = (id: string) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)))
  }

  const calculateNextDue = (time: string) => {
    const now = new Date()
    const [hours, minutes] = time.split(":").map(Number)
    const nextDue = new Date(now)
    nextDue.setHours(hours, minutes, 0, 0)

    if (nextDue <= now) {
      nextDue.setDate(nextDue.getDate() + 1)
    }

    return nextDue.toISOString()
  }

  const getTimeUntilNext = (nextDue: string) => {
    const now = new Date()
    const due = new Date(nextDue)
    const diff = due.getTime() - now.getTime()

    if (diff < 0) return "Overdue"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Medicine Reminders</h1>
          <p className="text-slate-400 mt-2">Never miss your medication with smart reminders</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-slate-400">Active Reminders</p>
                <p className="text-2xl font-bold text-white">{reminders.filter((r) => r.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-400">Due Today</p>
                <p className="text-2xl font-bold text-white">
                  {
                    reminders.filter(
                      (r) => r.isActive && new Date(r.nextDue).toDateString() === new Date().toDateString(),
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-slate-400">Overdue</p>
                <p className="text-2xl font-bold text-white">
                  {reminders.filter((r) => r.isActive && new Date(r.nextDue) < new Date()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Add New Reminder</CardTitle>
            <CardDescription>Set up a medication reminder with custom schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="medicine" className="text-slate-300">
                  Medicine Name
                </Label>
                <Input
                  id="medicine"
                  value={formData.medicineName}
                  onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                  placeholder="e.g., Amoxicillin"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="dosage" className="text-slate-300">
                  Dosage
                </Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g., 500mg"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency" className="text-slate-300">
                  Frequency
                </Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice">Twice Daily</SelectItem>
                    <SelectItem value="thrice">Three Times Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time" className="text-slate-300">
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.times[0]}
                  onChange={(e) => setFormData({ ...formData, times: [e.target.value] })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-slate-300">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g., Take with food, after meals"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label className="text-slate-300">Active</Label>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={addReminder} className="bg-blue-600 hover:bg-blue-700">
                  Add Reminder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reminders List */}
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No reminders yet</h3>
              <p className="text-slate-400 mb-4">Add your first medication reminder to get started</p>
              <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{reminder.medicineName}</h3>
                      <Badge variant={reminder.isActive ? "default" : "secondary"}>
                        {reminder.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Next: {getTimeUntilNext(reminder.nextDue)}
                      </Badge>
                    </div>
                    <p className="text-slate-300 mb-1">Dosage: {reminder.dosage}</p>
                    <p className="text-slate-400 text-sm">Times: {reminder.times.join(", ")}</p>
                    {reminder.notes && <p className="text-slate-400 text-sm mt-1">Notes: {reminder.notes}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleReminder(reminder.id)}
                      className="border-slate-600"
                    >
                      {reminder.isActive ? "Pause" : "Resume"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReminder(reminder.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
