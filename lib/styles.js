// Single source of truth for the 9 style descriptors.
// Edit one without touching the others.

export const VIBE_DESCRIPTORS = {
  "dark-tech": `Dark background (deep blacks, near-blacks, or very dark blue/purple), bright sans-serif type (system-ui or Inter-like), one neon or electric accent color (cyan, magenta, lime, or electric blue), terminal/grid feel, subtle gradients, sharp edges, generous whitespace.`,
  "light-bright": `Bright white or off-white background, bold colorful accents (saturated coral, yellow, teal, or magenta), playful sans-serif type, color blocks, friendly rounded corners, casual high-energy mood.`,
  "earthy-warm": `Cream, sand, terracotta, or sage background, warm neutral palette (browns, ochres, olive, dusty pink), serif or transitional type for headlines, soft rounded organic shapes, calm and grounded mood.`,
};

export const LAYOUT_DESCRIPTORS = {
  "hero-first": `Massive hero section taking ~90vh: huge headline (60-100px), one-sentence subhead, single bold CTA button, large hero image. Below: 3-4 short one-screen sections. End with another CTA.`,
  "story-scroll": `Long-form narrative scroll: alternating image-left/text-right sections, generous vertical spacing (~80px between sections), readable line lengths (~600px max width for body), more body copy than typical, ends with a quiet contextual CTA.`,
  "feature-grid": `Hero with headline + subhead + CTA. Then a 3-column feature grid (collapses to 1 column mobile), each cell with icon emoji + heading + 2-3 sentences. Below: simple testimonial or stats row, then CTA section.`,
};

export const PERSONALITY_DESCRIPTORS = {
  "serious": `Professional and trustworthy tone, confident copy, no exclamation marks, business-appropriate language, focus on outcomes and credibility.`,
  "playful": `Warm and witty tone, occasional exclamation marks and casual phrasing, personality-driven copy, light humor where it fits, conversational.`,
  "luxurious": `Refined and aspirational tone, deliberate sparse copy, white space treated as premium, considered word choice, evocative rather than descriptive language.`,
};
