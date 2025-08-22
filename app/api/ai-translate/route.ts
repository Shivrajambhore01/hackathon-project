import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { text, provider = "openai", options = {} } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    let result

    switch (provider) {
      case "openai":
        result = await translateWithOpenAI(text, options)
        break
      case "anthropic":
        result = await translateWithAnthropic(text, options)
        break
      case "huggingface":
        result = await translateWithHuggingFace(text, options)
        break
      default:
        result = await translateWithOpenAI(text, options)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("AI translation error:", error)
    return NextResponse.json(
      {
        error: "AI translation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function translateWithOpenAI(text: string, options: any) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  const prompt = `As a medical AI assistant, translate this prescription into clear, patient-friendly language:

"${text}"

Provide:
1. Plain language explanation
2. Step-by-step instructions  
3. Potential side effects
4. Important warnings
5. When to contact doctor

Format as JSON with: plainText, steps, sideEffects, warnings, contactDoctor`

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
          content: "You are a medical AI that translates prescriptions into patient-friendly language.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const result = await response.json()
  const content = result.choices[0]?.message?.content

  try {
    return JSON.parse(content)
  } catch {
    return {
      plainText: content,
      steps: [{ title: "Instructions", body: content }],
      sideEffects: [],
      warnings: [],
      contactDoctor: "Contact your doctor if you have any concerns.",
    }
  }
}

async function translateWithAnthropic(text: string, options: any) {
  // Placeholder for Anthropic Claude integration
  throw new Error("Anthropic integration not yet implemented")
}

async function translateWithHuggingFace(text: string, options: any) {
  // Placeholder for Hugging Face medical models
  throw new Error("Hugging Face integration not yet implemented")
}
