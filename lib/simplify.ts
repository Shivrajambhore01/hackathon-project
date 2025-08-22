import { medicalDictionary } from "./db"

interface SimplifyResponse {
  plainText: string
  steps: Array<{ title: string; body: string }>
  entities: {
    drug: string[]
    dose: string[]
    freq: string[]
    route: string[]
  }
  confidence: number
  warnings: string[]
}

export async function simplifyText(rawText: string): Promise<SimplifyResponse> {
  try {
    // Get settings from localStorage or environment
    const settings =
      typeof window !== "undefined" ? JSON.parse(localStorage.getItem("healthspeak-settings") || "{}") : {}

    const aiProvider = settings.aiProvider || process.env.AI_PROVIDER || "openai"

    // Use real AI model if configured
    if (settings.openaiKey || process.env.OPENAI_API_KEY) {
      return await simplifyWithOpenAI(rawText, settings)
    }

    // Fallback to enhanced mock processing
    return await enhancedMockSimplify(rawText, settings)
  } catch (error) {
    console.error("Simplification error:", error)
    // Fallback to basic mock
    return await enhancedMockSimplify(rawText, {})
  }
}

async function simplifyWithOpenAI(rawText: string, settings: any): Promise<SimplifyResponse> {
  const apiKey = settings.openaiKey || process.env.OPENAI_API_KEY

  const prompt = `You are a medical AI assistant specializing in prescription translation. 
  
  Convert this medical prescription into clear, plain language that a patient can easily understand:
  
  "${rawText}"
  
  Please provide:
  1. A simplified, conversational explanation
  2. Step-by-step instructions
  3. Extract medical entities (drugs, doses, frequencies, routes)
  4. Identify any potential warnings or side effects
  5. Rate your confidence (0-1) in the translation
  
  Respond in JSON format:
  {
    "plainText": "simplified explanation",
    "steps": [{"title": "step name", "body": "step description"}],
    "entities": {"drug": [], "dose": [], "freq": [], "route": []},
    "confidence": 0.95,
    "warnings": ["warning messages"]
  }`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant that translates prescriptions into plain language.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const result = await response.json()
  const content = result.choices[0]?.message?.content

  if (!content) {
    throw new Error("No response from OpenAI")
  }

  try {
    return JSON.parse(content)
  } catch (parseError) {
    // If JSON parsing fails, create structured response from text
    return parseOpenAITextResponse(content, rawText)
  }
}

function parseOpenAITextResponse(content: string, originalText: string): SimplifyResponse {
  // Extract entities using enhanced regex
  const entities = enhancedNER(originalText)

  return {
    plainText: content,
    steps: [{ title: "Instructions", body: content }],
    entities,
    confidence: 0.8,
    warnings: [],
  }
}

async function enhancedMockSimplify(rawText: string, settings: any): Promise<SimplifyResponse> {
  // Enhanced NER with better patterns
  const entities = enhancedNER(rawText)

  // Dictionary-based simplification
  let simplified = rawText
  for (const [abbr, meaning] of Object.entries(medicalDictionary)) {
    const regex = new RegExp(`\\b${abbr}\\b`, "gi")
    simplified = simplified.replace(regex, meaning)
  }

  // Generate more detailed steps
  const steps = generateDetailedSteps(entities, simplified)

  // Generate warnings based on detected medications
  const warnings = generateWarnings(entities)

  return {
    plainText: simplified,
    steps,
    entities,
    confidence: 0.75,
    warnings,
  }
}

function enhancedNER(text: string) {
  const entities = { drug: [], dose: [], freq: [], route: [] }

  // Enhanced drug name detection
  const drugPatterns = [
    /\b(Tab|Cap|Syrup|Inj|Oint|Cream)\s+([A-Z][a-z]{3,}(?:\s+[A-Z][a-z]+)?)/g,
    /\b([A-Z][a-z]{4,}(?:cillin|mycin|prazole|formin|caine|pine|zole))\b/g,
  ]

  drugPatterns.forEach((pattern) => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach((match) => {
        const drugName = match.replace(/^(Tab|Cap|Syrup|Inj|Oint|Cream)\s+/, "")
        if (!entities.drug.includes(drugName)) {
          entities.drug.push(drugName)
        }
      })
    }
  })

  // Enhanced dose detection
  const doseMatches = text.match(/\b\d+(?:\.\d+)?\s?(?:mg|mcg|g|ml|units?|IU)\b/gi)
  if (doseMatches) entities.dose = [...new Set(doseMatches)]

  // Enhanced frequency detection
  const freqMatches = text.match(/\b(TDS|OD|BD|QID|PRN|SOS|q\d+h|every\s+\d+\s+hours?)\b/gi)
  if (freqMatches) entities.freq = [...new Set(freqMatches)]

  // Enhanced route detection
  const routeMatches = text.match(/\b(p\.?o\.?|IV|IM|SC|SL|PR|PV|topical|inhaled)\b/gi)
  if (routeMatches) entities.route = [...new Set(routeMatches)]

  return entities
}

function generateDetailedSteps(entities: any, simplifiedText: string) {
  const steps = []

  if (entities.drug.length) {
    steps.push({
      title: "💊 Medication",
      body: `You have been prescribed ${entities.drug.join(", ")}. This medication will help treat your condition as determined by your doctor.`,
    })
  }

  if (entities.dose.length) {
    steps.push({
      title: "📏 Dosage",
      body: `Take ${entities.dose.join(", ")} as prescribed. Do not exceed this amount unless instructed by your healthcare provider.`,
    })
  }

  if (entities.freq.length) {
    const freqText = entities.freq.map((f) => medicalDictionary[f] || f).join(", ")
    steps.push({
      title: "⏰ When to Take",
      body: `Take this medication ${freqText}. Try to take it at the same times each day to maintain consistent levels in your body.`,
    })
  }

  if (entities.route.length) {
    const routeText = entities.route.map((r) => medicalDictionary[r.replace(/\./g, "")] || r).join(", ")
    steps.push({
      title: "🥄 How to Take",
      body: `Take this medication ${routeText}. Follow any specific instructions about food, water, or timing.`,
    })
  }

  steps.push({
    title: "⚠️ Important Reminders",
    body: "Complete the full course even if you feel better. Contact your doctor if you experience any unusual side effects or if your condition doesn't improve.",
  })

  return steps
}

function generateWarnings(entities: any): string[] {
  const warnings = []

  // Check for common drug interactions and warnings
  const drugs = entities.drug.map((d: string) => d.toLowerCase())

  if (drugs.some((d: string) => d.includes("warfarin") || d.includes("aspirin"))) {
    warnings.push("⚠️ Blood thinning medication - monitor for unusual bleeding")
  }

  if (drugs.some((d: string) => d.includes("metformin"))) {
    warnings.push("💡 Take with food to reduce stomach upset")
  }

  if (drugs.some((d: string) => d.includes("antibiotic") || d.includes("cillin"))) {
    warnings.push("🦠 Complete the full antibiotic course even if you feel better")
  }

  return warnings
}
