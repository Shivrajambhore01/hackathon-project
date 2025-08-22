"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isProcessing?: boolean
}

export function FileUpload({ onFileSelect, isProcessing = false }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          toast.error("File size must be less than 10MB")
          return
        }
        onFileSelect(file)
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: false,
    disabled: isProcessing,
  })

  if (isProcessing) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Processing Your Prescription</h3>
          <div className="space-y-2 text-sm text-slate-400">
            <p>Step 1: Extracting text from document...</p>
            <p>Step 2: Simplifying medical terminology...</p>
          </div>
        </div>
        <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
        ${
          isDragActive
            ? "border-blue-500 bg-blue-500/10"
            : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/20"
        }
      `}
    >
      <input {...getInputProps()} />

      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-slate-300" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {isDragActive ? "Drop your file here" : "Drag & drop a file or upload from your device"}
          </h3>
          <p className="text-sm text-slate-400 mb-4">Supports PDF, DOCX, JPG, PNG • Max file size: 10MB</p>

          <Button variant="outline" className="border-slate-600 hover:border-slate-500 bg-transparent">
            <File className="w-4 h-4 mr-2" />
            Choose File
          </Button>
        </div>
      </div>
    </div>
  )
}
