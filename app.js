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
const cog = document.getElementById("cog");
const elapsed = document.getElementById("elapsed");

let lastHtml = "";

const PROGRESS_MESSAGES = [
  "Choosing the palette…",
  "Sketching the layout…",
  "Writing headlines…",
  "Picking image seeds…",
  "Composing sections…",
  "Polishing copy…",
  "Tuning the spacing…",
  "Finalizing details…",
];

let progressTimer = null;
let messageTimer = null;
let startedAt = 0;
let msgIndex = 0;

function fmtElapsed(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function startProgressUi() {
  startedAt = Date.now();
  msgIndex = 0;
  cog.classList.remove("hidden");
  elapsed.classList.remove("hidden");
  elapsed.textContent = "0:00";
  status.textContent = PROGRESS_MESSAGES[0];
  progressTimer = setInterval(() => {
    elapsed.textContent = fmtElapsed(Date.now() - startedAt);
  }, 250);
  messageTimer = setInterval(() => {
    msgIndex = (msgIndex + 1) % PROGRESS_MESSAGES.length;
    status.textContent = PROGRESS_MESSAGES[msgIndex];
  }, 3200);
}

function stopProgressUi() {
  clearInterval(progressTimer);
  clearInterval(messageTimer);
  progressTimer = null;
  messageTimer = null;
  cog.classList.add("hidden");
  elapsed.classList.add("hidden");
}

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
  preview.srcdoc = "<body style='font-family:sans-serif;padding:40px;color:#aaa;text-align:center'><div style='margin-top:80px;font-size:14px'>thinking…</div></body>";
  downloadBtn.disabled = true;
  openBtn.disabled = true;
  lastHtml = "";
  startProgressUi();

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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const now = Date.now();
      if (now - lastRender > RENDER_INTERVAL_MS) {
        preview.srcdoc = buffer;
        lastRender = now;
      }
    }

    // Final render after stream completes
    preview.srcdoc = buffer;
    lastHtml = buffer;
    const took = fmtElapsed(Date.now() - startedAt);
    stopProgressUi();
    status.textContent = `done in ${took} · ${state.vibe} · ${state.layout} · ${state.personality} · ${remaining()} left`;
    downloadBtn.disabled = false;
    openBtn.disabled = false;
    updateRemainingHint();
  } catch (err) {
    stopProgressUi();
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
