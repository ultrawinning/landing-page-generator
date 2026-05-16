// Vercel Edge function — co-hosted with the frontend, so relative URL works.
const API_URL = "/api/generate";

// Client-side per-user limit (localStorage; bypassable by anyone in devtools).
const MAX_GENERATIONS_PER_USER = 5;
const STORAGE_KEY = "lpg.generations.used";

function getUsed() {
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}
function bumpUsed() {
  localStorage.setItem(STORAGE_KEY, String(getUsed() + 1));
}
function remaining() {
  return Math.max(0, MAX_GENERATIONS_PER_USER - getUsed());
}

const state = {
  vibe: "dark-tech",
  layout: "hero-first",
  personality: "serious",
};

const VIBES = ["dark-tech", "light-bright", "earthy-warm"];
const LAYOUTS = ["hero-first", "story-scroll", "feature-grid"];
const PERSONALITIES = ["serious", "playful", "luxurious"];

document.querySelectorAll(".picker-row").forEach((row) => {
  const axis = row.dataset.axis;
  row.querySelectorAll("button.picker").forEach((btn) => {
    btn.addEventListener("click", () => {
      state[axis] = btn.dataset.value;
      refreshPickers();
    });
  });
});

function refreshPickers() {
  document.querySelectorAll(".picker-row").forEach((row) => {
    const axis = row.dataset.axis;
    row.querySelectorAll("button.picker").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.value === state[axis]);
    });
  });
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

document.getElementById("random-btn").addEventListener("click", () => {
  state.vibe = pickRandom(VIBES);
  state.layout = pickRandom(LAYOUTS);
  state.personality = pickRandom(PERSONALITIES);
  refreshPickers();
});

const generateBtn = document.getElementById("generate-btn");
const briefInput = document.getElementById("brief-input");
const output = document.getElementById("output");
const status = document.getElementById("status");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("download-btn");
const openBtn = document.getElementById("open-btn");

let lastHtml = "";

generateBtn.addEventListener("click", async () => {
  const brief = briefInput.value.trim();
  if (!brief) {
    briefInput.focus();
    return;
  }

  if (remaining() <= 0) {
    output.classList.remove("hidden");
    status.textContent = `Limit reached — ${MAX_GENERATIONS_PER_USER} generations per user.`;
    preview.srcdoc = `<body style='font-family:sans-serif;padding:40px;color:#888'><h2>Out of generations</h2><p>This demo limits each visitor to ${MAX_GENERATIONS_PER_USER} pages. Refresh, clear site data, or come back later.</p></body>`;
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating…";
  output.classList.remove("hidden");
  status.textContent = `${state.vibe} · ${state.layout} · ${state.personality} — generating…`;
  preview.srcdoc = "<body style='font-family:sans-serif;padding:40px;color:#888'>thinking…</body>";
  downloadBtn.disabled = true;
  openBtn.disabled = true;
  lastHtml = "";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief, ...state }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API ${res.status}: ${err}`);
    }
    if (!res.body) throw new Error("No response body");

    bumpUsed();

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let lastRender = 0;
    const RENDER_INTERVAL_MS = 750;
    let chars = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      chars = buffer.length;
      const now = Date.now();
      if (now - lastRender > RENDER_INTERVAL_MS) {
        preview.srcdoc = buffer;
        lastRender = now;
      }
      status.textContent = `${state.vibe} · ${state.layout} · ${state.personality} — ${chars.toLocaleString()} chars…`;
    }

    // Final render after stream completes
    preview.srcdoc = buffer;
    lastHtml = buffer;
    status.textContent = `done · ${state.vibe} · ${state.layout} · ${state.personality} · ${remaining()} left`;
    downloadBtn.disabled = false;
    openBtn.disabled = false;
    updateRemainingHint();
  } catch (err) {
    status.textContent = `error: ${err.message}`;
    preview.srcdoc = `<body style='font-family:sans-serif;padding:40px;color:#c33'><h2>Generation failed</h2><pre>${escapeHtml(err.message)}</pre></body>`;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate →";
  }
});

downloadBtn.addEventListener("click", () => {
  if (!lastHtml) return;
  const blob = new Blob([lastHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `landing-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
});

openBtn.addEventListener("click", () => {
  if (!lastHtml) return;
  const blob = new Blob([lastHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
});

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[c]));
}

function updateRemainingHint() {
  const tag = document.querySelector("header .tag");
  if (!tag) return;
  const left = remaining();
  if (left < MAX_GENERATIONS_PER_USER) {
    tag.textContent = `Type a brief. Pick a vibe. Get a landing page. (${left} of ${MAX_GENERATIONS_PER_USER} left)`;
  }
}

refreshPickers();
updateRemainingHint();
