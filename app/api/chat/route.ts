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
  provider: "gemini" | "openai" | "ollama";
  model: string;
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "codellama:latest";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

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

  const fullMessages = [{ role: "system", content: systemPrompt }, ...messages];

  try {
    if (GEMINI_API_KEY) {
      try {
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

          if (statusCode === 429) {
            console.warn(
              "Gemini quota exceeded, falling back to OpenAI",
              safeMessage,
            );
            throw new Error("GEMINI_QUOTA_EXCEEDED");
          }
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
          throw new Error("No response from AI model");
        }

        return {
          content,
          provider: "gemini",
          model: GEMINI_MODEL,
        };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "GEMINI_QUOTA_EXCEEDED"
        ) {
          console.log("Retrying with OpenAI due to Gemini quota...");
        } else {
          throw error;
        }
      }
    }

    if (OPENAI_API_KEY) {
      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        const safeMessage = extractSafeErrorDetails(body);
        throw new Error(
          `OpenAI error (${response.status}): ${safeMessage || "Unknown OpenAI error"}`,
        );
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content || typeof content !== "string") {
        throw new Error("No response from AI model");
      }

      return {
        content: content.trim(),
        provider: "openai",
        model: OPENAI_MODEL,
      };
    }

    const allowOllamaFallback =
      !!process.env.OLLAMA_BASE_URL && !OLLAMA_BASE_URL.includes("localhost");

    if (!allowOllamaFallback) {
      throw new Error(
        "Gemini is unavailable and no OPENAI_API_KEY is configured. Configure OPENAI_API_KEY or OLLAMA_BASE_URL for production.",
      );
    }

    const prompt = fullMessages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n\n");

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      const safeMessage = extractSafeErrorDetails(body);
      throw new Error(
        `Ollama error (${response.status}): ${safeMessage || "Unknown Ollama error"}`,
      );
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error("No response from AI model");
    }

    return {
      content: data.response.trim(),
      provider: "ollama",
      model: OLLAMA_MODEL,
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
    const activeModel =
      requestedModel && aiResult.provider === "gemini"
        ? requestedModel
        : aiResult.model;

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
        provider: GEMINI_API_KEY
          ? "gemini"
          : OPENAI_API_KEY
            ? "openai"
            : "ollama",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
