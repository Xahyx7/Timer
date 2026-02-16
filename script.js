const hh = document.getElementById("hh");
const mm = document.getElementById("mm");
const ss = document.getElementById("ss");

const loaders = document.querySelectorAll(".loader");
const rects = document.querySelectorAll(".loader rect");

const overlay = document.getElementById("overlay");
const todayEl = document.getElementById("todayTime");
const weekEl = document.getElementById("weekData");
const yearEl = document.getElementById("yearData");

let running = false;
let startTime = null;
let elapsed = 0;
let lastTickDate = null;
let rafId = null;
let dirtySession = false;

/* ---------------- LOADER TOGGLE (P) ---------------- */
let loaderEnabled = localStorage.getItem("loader-enabled");
loaderEnabled = loaderEnabled === null ? true : loaderEnabled === "true";

function applyLoaderState() {
  loaders.forEach(l => l.style.display = loaderEnabled ? "block" : "none");
  localStorage.setItem("loader-enabled", loaderEnabled);
}
applyLoaderState();

/* ---------------- DATE HELPERS (LOCAL, NOT UTC) ---------------- */
function localDateString(date = new Date()) {
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");
}

/* ---------------- DISPLAY ---------------- */
function render(ms) {
  const s = Math.floor(ms / 1000);
  hh.textContent = String(Math.floor(s / 3600)).padStart(2, "0");
  mm.textContent = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  ss.textContent = String(s % 60).padStart(2, "0");
}

/* ---------------- START ---------------- */
function start() {
  startTime = Date.now() - elapsed;
  lastTickDate = localDateString();
  dirtySession = true;
  if (loaderEnabled) rects.forEach(r => r.style.animationPlayState = "running");
  loop();
}

/* ---------------- PAUSE (NO SAVE) ---------------- */
function pause() {
  cancelAnimationFrame(rafId);
  elapsed = Date.now() - startTime;
  rects.forEach(r => r.style.animationPlayState = "paused");
}

/* ---------------- RESET (SAVE) ---------------- */
function reset() {
  cancelAnimationFrame(rafId);

  if (dirtySession && elapsed > 0) {
    saveToDate(lastTickDate, elapsed);
  }

  running = false;
  elapsed = 0;
  startTime = null;
  dirtySession = false;

  rects.forEach(r => {
    r.style.animationPlayState = "paused";
    r.style.strokeDashoffset = "0";
  });

  render(0);
}

/* ---------------- LOOP + MIDNIGHT SPLIT ---------------- */
function loop() {
  rafId = requestAnimationFrame(loop);

  const now = Date.now();
  elapsed = now - startTime;

  const today = localDateString();
  if (today !== lastTickDate) {
    // crossed local midnight
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    const beforeMidnight = midnight.getTime() - startTime;
    if (beforeMidnight > 0) {
      saveToDate(lastTickDate, beforeMidnight);
    }

    startTime = midnight.getTime();
    elapsed = now - startTime;
    lastTickDate = today;
  }

  render(elapsed);
}

/* ---------------- STORAGE ---------------- */
function saveToDate(date, ms) {
  const data = JSON.parse(localStorage.getItem("focus-time") || "{}");
  data[date] = (data[date] || 0) + ms;
  localStorage.setItem("focus-time", JSON.stringify(data));
}

/* ---------------- ANALYTICS ---------------- */
function loadAnalytics() {
  const data = JSON.parse(localStorage.getItem("focus-time") || "{}");

  const today = localDateString();
  const t = data[today] || 0;
  todayEl.textContent =
    `${Math.floor(t / 3600000)}h ${Math.floor((t % 3600000) / 60000)}m`;

  weekEl.innerHTML = "";
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = localDateString(d);
    weekEl.innerHTML +=
      `<li>${d.toLocaleDateString(undefined, { weekday: "short" })}: ${Math.floor((data[k] || 0) / 60000)}m</li>`;
  }

  yearEl.innerHTML = "";
  const months = {};
  Object.keys(data).forEach(k => {
    const m = k.slice(0, 7);
    months[m] = (months[m] || 0) + data[k];
  });
  Object.keys(months).forEach(m => {
    yearEl.innerHTML +=
      `<li>${m}: ${Math.floor(months[m] / 3600000)}h</li>`;
  });
}

/* ---------------- EVENTS ---------------- */
document.body.addEventListener("click", () => {
  if (overlay.classList.contains("show")) return;
  running = !running;
  running ? start() : pause();
});

document.body.addEventListener("dblclick", reset);

/* analytics open */
let holdTimer;
document.body.addEventListener("mousedown", () => {
  holdTimer = setTimeout(() => {
    loadAnalytics();
    overlay.classList.add("show");
  }, 400);
});
document.body.addEventListener("mouseup", () => {
  clearTimeout(holdTimer);
  overlay.classList.remove("show");
});

document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "a") {
    loadAnalytics();
    overlay.classList.toggle("show");
  }
  if (e.key.toLowerCase() === "p") {
    loaderEnabled = !loaderEnabled;
    applyLoaderState();
  }
});

/* warn before leaving */
window.addEventListener("beforeunload", e => {
  if (dirtySession && elapsed > 0) {
    e.preventDefault();
    e.returnValue = "";
  }
});

render(0);
