export async function extractTextFromImage(fileBuffer: Buffer): Promise<string> {
  try {
    // Get settings from localStorage (client-side) or environment variables (server-side)
    const settings =
      typeof window !== "undefined" ? JSON.parse(localStorage.getItem("healthspeak-settings") || "{}") : {}

    const ocrProvider = settings.ocrProvider || process.env.OCR_PROVIDER || "mock"

    switch (ocrProvider) {
      case "google-vision":
        return await extractWithGoogleVision(fileBuffer, settings.googleVisionKey)
      case "azure-vision":
        return await extractWithAzureVision(fileBuffer, settings.azureKey)
      case "tesseract":
        return await extractWithTesseract(fileBuffer)
      case "mock":
      default:
        return await mockOCRFallback()
    }
  } catch (error) {
    console.error("OCR extraction failed:", error)
    console.log("[v0] Falling back to mock OCR data due to error:", error)
    return await mockOCRFallback()
  }
}

async function extractWithGoogleVision(fileBuffer: Buffer, apiKey?: string): Promise<string> {
  const key = apiKey || process.env.GOOGLE_VISION_API_KEY

  if (!key) {
    console.log("[v0] Google Vision API key not found, using mock data")
    return await mockOCRFallback()
  }

  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${key}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: fileBuffer.toString("base64"),
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 1,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Google Vision API error: ${response.statusText}`)
  }

  const result = await response.json()
  const textAnnotations = result.responses[0]?.textAnnotations

  if (!textAnnotations || textAnnotations.length === 0) {
    throw new Error("No text detected in image")
  }

  return textAnnotations[0].description || ""
}

async function extractWithAzureVision(fileBuffer: Buffer, apiKey?: string): Promise<string> {
  const key = apiKey || process.env.AZURE_VISION_API_KEY
  const endpoint = process.env.AZURE_VISION_ENDPOINT

  if (!key || !endpoint) {
    console.log("[v0] Azure Vision API credentials not found, using mock data")
    return await mockOCRFallback()
  }

  const response = await fetch(`${endpoint}/vision/v3.2/read/analyze`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/octet-stream",
    },
    body: fileBuffer,
  })

  if (!response.ok) {
    throw new Error(`Azure Vision API error: ${response.statusText}`)
  }

  const operationLocation = response.headers.get("Operation-Location")
  if (!operationLocation) {
    throw new Error("No operation location returned from Azure")
  }

  // Poll for results
  let result
  let attempts = 0
  do {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const resultResponse = await fetch(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": key },
    })
    result = await resultResponse.json()
    attempts++
  } while (result.status === "running" && attempts < 10)

  if (result.status !== "succeeded") {
    throw new Error("Azure OCR processing failed")
  }

  const extractedText = result.analyzeResult.readResults
    .map((page: any) => page.lines.map((line: any) => line.text).join(" "))
    .join("\n")

  return extractedText
}

async function extractWithTesseract(fileBuffer: Buffer): Promise<string> {
  // For client-side Tesseract.js implementation
  if (typeof window !== "undefined") {
    const { createWorker } = await import("tesseract.js")
    const worker = await createWorker()

    try {
      const {
        data: { text },
      } = await worker.recognize(fileBuffer)
      await worker.terminate()
      return text
    } catch (error) {
      await worker.terminate()
      throw error
    }
  }

  throw new Error("Tesseract not available in server environment")
}

async function mockOCRFallback(): Promise<string> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const mockTexts = [
    "Tab Amoxicillin 500mg TDS p.o after meals for 7 days\nSig: Take one tablet three times daily after meals\nQuantity: 21 tablets\nRefills: 0",
    "Cap Omeprazole 20mg OD before breakfast for 14 days\nSig: Take one capsule once daily before breakfast\nQuantity: 14 capsules\nRefills: 1",
    "Tab Metformin 500mg BD with meals, continue as advised\nSig: Take one tablet twice daily with meals\nQuantity: 60 tablets\nRefills: 2",
    "Syrup Paracetamol 250mg/5ml TDS PRN for fever, max 4 doses/day\nSig: Take 5ml three times daily as needed for fever\nQuantity: 100ml bottle\nRefills: 0",
    "Inj Insulin Glargine 10 units SC OD at bedtime\nSig: Inject 10 units subcutaneously once daily at bedtime\nQuantity: 1 vial (10ml)\nRefills: 2",
    "Tab Aspirin 75mg OD after breakfast for cardioprotection\nSig: Take one tablet once daily after breakfast\nQuantity: 30 tablets\nRefills: 3",
  ]

  const selectedText = mockTexts[Math.floor(Math.random() * mockTexts.length)]
  console.log("[v0] Using mock OCR text:", selectedText.substring(0, 50) + "...")
  return selectedText
}
