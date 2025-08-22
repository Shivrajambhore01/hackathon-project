"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Edit, Save, X } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Sophia Clark",
    email: "sophia.clark@example.com",
    memberSince: "2022-03-15",
    avatar: "",
  })

  const [editForm, setEditForm] = useState(profile)

  const handleEdit = () => {
    setEditForm(profile)
    setIsEditing(true)
  }

  const handleSave = () => {
    setProfile(editForm)
    setIsEditing(false)
    toast.success("Profile updated successfully")
  }

  const handleCancel = () => {
    setEditForm(profile)
    setIsEditing(false)
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-slate-400">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-slate-800 border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                  {!isEditing ? (
                    <Button onClick={handleEdit} variant="outline" className="border-slate-600 bg-transparent">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 bg-transparent"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-start space-x-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-slate-700 text-white text-xl">
                        {profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button variant="outline" size="sm" className="mt-2 w-full border-slate-600 bg-transparent">
                        Change Photo
                      </Button>
                    )}
                  </div>

                  {/* Form */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-slate-300">
                        Full Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="mt-1 bg-slate-700 border-slate-600 text-white"
                        />
                      ) : (
                        <p className="mt-1 text-white">{profile.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-slate-300">
                        Email Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="mt-1 bg-slate-700 border-slate-600 text-white"
                        />
                      ) : (
                        <p className="mt-1 text-white">{profile.email}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-slate-300">Member Since</Label>
                      <p className="mt-1 text-white">
                        {new Date(profile.memberSince).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Stats Card */}
            <div className="space-y-6">
              <Card className="p-6 bg-slate-800 border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Account Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Translations</span>
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                      24
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">This Month</span>
                    <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                      8
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Saved Items</span>
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                      12
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-800 border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start border-slate-600 bg-transparent">
                    <User className="w-4 h-4 mr-2" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-slate-600 bg-transparent">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Preferences
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-slate-600 bg-transparent">
                    <Calendar className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
