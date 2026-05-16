import { buildSystemPrompt, buildUserPrompt } from "../lib/prompts.js";
import { VIBE_DESCRIPTORS, LAYOUT_DESCRIPTORS, PERSONALITY_DESCRIPTORS } from "../lib/styles.js";

export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("POST only", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { brief, vibe, layout, personality } = body || {};

  if (!brief || typeof brief !== "string" || brief.length < 5) {
    return new Response("brief required (5+ chars)", { status: 400 });
  }
  if (brief.length > 2000) {
    return new Response("brief too long (max 2000 chars)", { status: 400 });
  }
  if (!vibe || !(vibe in VIBE_DESCRIPTORS)) {
    return new Response("invalid vibe", { status: 400 });
  }
  if (!layout || !(layout in LAYOUT_DESCRIPTORS)) {
    return new Response("invalid layout", { status: 400 });
  }
  if (!personality || !(personality in PERSONALITY_DESCRIPTORS)) {
    return new Response("invalid personality", { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("ANTHROPIC_API_KEY not configured on server", { status: 500 });
  }

  const systemPrompt = buildSystemPrompt(vibe, layout, personality);
  const userPrompt = buildUserPrompt(brief);

  const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
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
    return new Response(`Anthropic ${anthropicResp.status}: ${errText}`, { status: 502 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = anthropicResp.body.getReader();
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
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
