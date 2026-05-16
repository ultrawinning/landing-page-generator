import { VIBE_DESCRIPTORS, LAYOUT_DESCRIPTORS, PERSONALITY_DESCRIPTORS } from "./styles";
import type { Vibe, Layout, Personality } from "./styles";

export function buildSystemPrompt(vibe: Vibe, layout: Layout, personality: Personality): string {
  return `You generate single-file HTML landing pages. Output ONLY raw HTML — no markdown fences, no explanations, no preamble. Start with <!DOCTYPE html> and end with </html>.

REQUIREMENTS:
- Self-contained: all CSS inline in a <style> tag, no external CSS, no external JS
- Mobile responsive
- Accessible (semantic HTML, alt text on images)
- Use real-feeling content (specific numbers, names, copy written for THIS business — never lorem ipsum)
- Include 2-4 images using picsum.photos with seeded URLs:
  https://picsum.photos/seed/<unique-seed-per-image>/<width>/<height>
  Pick seeds that loosely relate to the business (e.g. "yoga-studio-hero", "yoga-studio-team-1"). Width/height should suit the slot (hero ~1600x900, thumbnails ~600x400).

STYLE — VIBE:
${VIBE_DESCRIPTORS[vibe]}

STYLE — LAYOUT:
${LAYOUT_DESCRIPTORS[layout]}

STYLE — PERSONALITY:
${PERSONALITY_DESCRIPTORS[personality]}

All three style axes must show through clearly. Don't water them down.`;
}

export function buildUserPrompt(brief: string): string {
  return `Business brief:\n\n${brief}\n\nGenerate the complete HTML landing page now. Output raw HTML only, starting with <!DOCTYPE html>.`;
}
