import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  model?: string;
}

interface AIResponseResult {
  content: string;
  provider: "gemini";
  model: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

async function generateAIResponse(
  messages: ChatMessage[],
): Promise<AIResponseResult> {
  const systemPrompt = `You are a helpful AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice  
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. Use proper code formatting when showing examples.`;

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in environment");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: messages.map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          })),
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1000,
          },
        }),
      },
    );

    if (!response.ok) {
      const statusCode = response.status;
      const body = await response.text();
      const safeMessage = extractSafeErrorDetails(body);
      throw new Error(
        `Gemini error (${statusCode}): ${safeMessage || "Unknown Gemini error"}`,
      );
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const content = Array.isArray(parts)
      ? parts
          .map((part) => (typeof part?.text === "string" ? part.text : ""))
          .join("")
          .trim()
      : "";

    if (!content) {
      throw new Error("No response from Gemini API");
    }

    return {
      content,
      provider: "gemini",
      model: GEMINI_MODEL,
    };
  } catch (error) {
    console.error("AI generation error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown AI provider error";
    throw new Error(message || "Failed to generate AI response");
  }
}

function extractSafeErrorDetails(errorBody: string): string {
  try {
    const parsed = JSON.parse(errorBody);
    const message =
      parsed?.error?.message || parsed?.message || parsed?.error || errorBody;
    return String(message);
  } catch {
    return errorBody;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, history = [], model } = body;

    // Validate input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 },
      );
    }

    // Validate history format
    const validHistory = Array.isArray(history)
      ? history.filter(
          (msg) =>
            msg &&
            typeof msg === "object" &&
            typeof msg.role === "string" &&
            typeof msg.content === "string" &&
            ["user", "assistant"].includes(msg.role),
        )
      : [];

    const recentHistory = validHistory.slice(-10);

    const messages: ChatMessage[] = [
      ...recentHistory,
      { role: "user", content: message },
    ];

    //   Generate ai response

    const aiResult = await generateAIResponse(messages);

    const requestedModel = typeof model === "string" ? model.trim() : "";
    const activeModel = requestedModel || aiResult.model;

    return NextResponse.json({
      response: aiResult.content,
      provider: aiResult.provider,
      model: activeModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: errorMessage,
        provider: "gemini",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
