"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Calendar, FileText, Trash2, Download, Share2, Filter } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { VoiceControls } from "@/components/controls/voice-controls"

interface HistoryItem {
  id: string
  text: string
  simplified: string
  filename: string
  result?: {
    plainText: string
    steps: Array<{ title: string; body: string }>
    entities?: { drug?: string[]; dose?: string[]; route?: string[]; freq?: string[] }
  }
  createdAt: string
  tags?: string[]
  category?: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)
  const [sortBy, setSortBy] = useState("newest")
  const [filterCategory, setFilterCategory] = useState("all")
  const itemsPerPage = 10

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history")
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      } else {
        const localHistory = localStorage.getItem("healthspeak-history")
        if (localHistory) {
          setHistory(JSON.parse(localHistory))
        }
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
      const localHistory = localStorage.getItem("healthspeak-history")
      if (localHistory) {
        setHistory(JSON.parse(localHistory))
      }
    }
  }

  const filteredHistory = history
    .filter((item) => {
      const matchesSearch =
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.simplified.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))

      const matchesCategory = filterCategory === "all" || item.category === filterCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "filename":
          return a.filename.localeCompare(b.filename)
        default:
          return 0
      }
    })

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage)

  const handleView = (item: HistoryItem) => {
    setSelectedItem(item)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/history/${id}`, { method: "DELETE" })
      if (response.ok) {
        setHistory(history.filter((item) => item.id !== id))
        toast.success("Translation deleted successfully")
      } else {
        const updatedHistory = history.filter((item) => item.id !== id)
        setHistory(updatedHistory)
        localStorage.setItem("healthspeak-history", JSON.stringify(updatedHistory))
        toast.success("Translation deleted successfully")
      }
    } catch (error) {
      console.error("Failed to delete:", error)
      toast.error("Failed to delete translation")
    }
  }

  const handleExport = (item: HistoryItem) => {
    const exportData = {
      filename: item.filename,
      originalText: item.text,
      simplifiedText: item.simplified,
      result: item.result,
      date: item.createdAt,
      tags: item.tags,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${item.filename}_translation.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Translation exported successfully")
  }

  const handleShare = async (item: HistoryItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `HealthSpeak Translation: ${item.filename}`,
          text: `Original: ${item.text}\n\nSimplified: ${item.simplified}`,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `HealthSpeak Translation: ${item.filename}\n\nOriginal: ${item.text}\n\nSimplified: ${item.simplified}`
      navigator.clipboard.writeText(shareText)
      toast.success("Translation copied to clipboard")
    }
  }

  const categories = Array.from(new Set(history.map((item) => item.category).filter(Boolean)))

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      {/* <Sidebar /> */}

      <main className="flex-1 ml-64">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Translation History</h1>
            <p className="text-slate-400">View and manage your previously translated prescriptions</p>
            <div className="mt-4 flex items-center space-x-4 text-sm text-slate-400">
              <span>Total: {history.length} translations</span>
              <span>•</span>
              <span>
                This month:{" "}
                {history.filter((item) => new Date(item.createdAt).getMonth() === new Date().getMonth()).length}
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by filename, prescription text, translation, or tags..."
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="filename">Filename</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* History List */}
          <div className="space-y-4">
            {paginatedHistory.length === 0 ? (
              <Card className="p-12 bg-slate-800 border-slate-700 text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No translations found</h3>
                <p className="text-slate-400">
                  {searchTerm ? "Try adjusting your search terms" : "Start by translating your first prescription"}
                </p>
              </Card>
            ) : (
              paginatedHistory.map((item) => (
                <Card key={item.id} className="p-6 bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                          {item.filename}
                        </Badge>
                        {item.category && (
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {item.category}
                          </Badge>
                        )}
                        <div className="flex items-center text-sm text-slate-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(item.createdAt), "MMM dd, yyyy • HH:mm")}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Original:</p>
                          <p className="text-slate-300 text-sm line-clamp-2">{item.text}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Simplified:</p>
                          <p className="text-white text-sm line-clamp-2">{item.simplified}</p>
                        </div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-slate-400">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(item)}
                          className="border-slate-600 hover:border-slate-500"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(item)}
                          className="border-slate-600 hover:border-slate-500"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare(item)}
                          className="border-slate-600 hover:border-slate-500"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="border-slate-600 hover:border-red-500 hover:text-red-400 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-slate-600"
              >
                Previous
              </Button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "" : "border-slate-600"}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-slate-600"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Translation Details</h3>
                <Button variant="outline" onClick={() => setSelectedItem(null)} className="border-slate-600">
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Filename:</p>
                    <p className="text-white">{selectedItem.filename}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Date:</p>
                    <p className="text-white">{format(new Date(selectedItem.createdAt), "MMMM dd, yyyy • HH:mm")}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Original Text:</p>
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <p className="text-slate-300">{selectedItem.text}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Simplified Translation:</p>
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <p className="text-white">{selectedItem.simplified}</p>
                    </div>
                    <VoiceControls text={selectedItem.simplified} />
                  </div>

                  {selectedItem.result?.steps && (
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-2">Step-by-step Instructions:</p>
                      <div className="space-y-2">
                        {selectedItem.result.steps.map((step, index) => (
                          <div key={index} className="p-3 bg-slate-700 rounded-lg">
                            <h4 className="font-medium text-white mb-1">{step.title}</h4>
                            <p className="text-slate-300 text-sm">{step.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.result?.entities && (
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-2">Extracted Information:</p>
                      <div className="space-y-2">
                        {Object.entries(selectedItem.result.entities).map(
                          ([key, values]) =>
                            values &&
                            values.length > 0 && (
                              <div key={key} className="flex items-center space-x-2">
                                <span className="text-sm text-slate-400 capitalize">{key}:</span>
                                <div className="flex flex-wrap gap-1">
                                  {values.map((value, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {value}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-700">
                <Button variant="outline" onClick={() => handleExport(selectedItem)} className="border-slate-600">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={() => handleShare(selectedItem)} className="border-slate-600">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
