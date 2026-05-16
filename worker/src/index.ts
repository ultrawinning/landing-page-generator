import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import { VIBE_DESCRIPTORS, LAYOUT_DESCRIPTORS, PERSONALITY_DESCRIPTORS } from "./styles";
import type { Vibe, Layout, Personality } from "./styles";

interface Env {
  ANTHROPIC_API_KEY: string;
}

interface GenerateBody {
  brief?: string;
  vibe?: string;
  layout?: string;
  personality?: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(req.url);
    if (url.pathname !== "/generate" || req.method !== "POST") {
      return new Response("Not found", { status: 404, headers: CORS_HEADERS });
    }

    let body: GenerateBody;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400, headers: CORS_HEADERS });
    }

    const { brief, vibe, layout, personality } = body;
    if (!brief || typeof brief !== "string" || brief.length < 5) {
      return new Response("brief required (5+ chars)", { status: 400, headers: CORS_HEADERS });
    }
    if (brief.length > 2000) {
      return new Response("brief too long (max 2000 chars)", { status: 400, headers: CORS_HEADERS });
    }
    if (!vibe || !(vibe in VIBE_DESCRIPTORS)) {
      return new Response("invalid vibe", { status: 400, headers: CORS_HEADERS });
    }
    if (!layout || !(layout in LAYOUT_DESCRIPTORS)) {
      return new Response("invalid layout", { status: 400, headers: CORS_HEADERS });
    }
    if (!personality || !(personality in PERSONALITY_DESCRIPTORS)) {
      return new Response("invalid personality", { status: 400, headers: CORS_HEADERS });
    }

    const systemPrompt = buildSystemPrompt(vibe as Vibe, layout as Layout, personality as Personality);
    const userPrompt = buildUserPrompt(brief);

    const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        stream: true,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicResp.ok) {
      const errText = await anthropicResp.text();
      return new Response(`Anthropic ${anthropicResp.status}: ${errText}`, {
        status: 502,
        headers: CORS_HEADERS,
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicResp.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (!data) continue;
              try {
                const event = JSON.parse(data);
                if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                  controller.enqueue(encoder.encode(event.delta.text));
                }
              } catch {
                // ignore mid-stream parse errors
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  },
};
