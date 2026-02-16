const hh = document.getElementById("hh");
const mm = document.getElementById("mm");
const ss = document.getElementById("ss");
const rects = document.querySelectorAll(".loader rect");

const overlay = document.getElementById("overlay");
const todayEl = document.getElementById("todayTime");
const weekEl = document.getElementById("weekData");
const yearEl = document.getElementById("yearData");

let running = false;
let startTime = null;
let elapsed = 0;
let rafId = null;

/* TIMER */
function render(ms) {
  const s = Math.floor(ms / 1000);
  hh.textContent = String(Math.floor(s / 3600)).padStart(2, "0");
  mm.textContent = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  ss.textContent = String(s % 60).padStart(2, "0");
}

function start() {
  startTime = Date.now() - elapsed;
  rects.forEach(r => {
    r.style.animationPlayState = "running";
  });
  loop();
}

function pause() {
  cancelAnimationFrame(rafId);
  elapsed = Date.now() - startTime;
  saveTime(elapsed);
  rects.forEach(r => r.style.animationPlayState = "paused");
}

function reset() {
  cancelAnimationFrame(rafId);
  running = false;
  elapsed = 0;
  startTime = null;
  rects.forEach(r => {
    r.style.animationPlayState = "paused";
    r.style.strokeDashoffset = "0";
  });
  render(0);
}

function loop() {
  rafId = requestAnimationFrame(loop);
  elapsed = Date.now() - startTime;
  render(elapsed);
}

/* STORAGE */
function saveTime(ms) {
  if (ms <= 0) return;
  const today = new Date().toISOString().slice(0,10);
  const data = JSON.parse(localStorage.getItem("focus-time") || "{}");
  data[today] = (data[today] || 0) + ms;
  localStorage.setItem("focus-time", JSON.stringify(data));
}

/* ANALYTICS */
function loadAnalytics() {
  const data = JSON.parse(localStorage.getItem("focus-time") || "{}");

  // Today
  const todayKey = new Date().toISOString().slice(0,10);
  const t = data[todayKey] || 0;
  todayEl.textContent = `${Math.floor(t/3600000)}h ${Math.floor((t%3600000)/60000)}m`;

  // Week
  weekEl.innerHTML = "";
  for (let i=6;i>=0;i--) {
    const d = new Date();
    d.setDate(d.getDate()-i);
    const k = d.toISOString().slice(0,10);
    const v = data[k] || 0;
    weekEl.innerHTML += `<li>${d.toLocaleDateString(undefined,{weekday:"short"})}: ${Math.floor(v/60000)}m</li>`;
  }

  // Year
  yearEl.innerHTML = "";
  const months = {};
  Object.keys(data).forEach(k=>{
    const m = k.slice(0,7);
    months[m] = (months[m]||0) + data[k];
  });
  Object.keys(months).forEach(m=>{
    yearEl.innerHTML += `<li>${m}: ${Math.floor(months[m]/3600000)}h</li>`;
  });
}

/* EVENTS */
document.body.addEventListener("click", () => {
  running = !running;
  running ? start() : pause();
});

document.body.addEventListener("dblclick", reset);

// Hold mouse OR press A for analytics
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
});

render(0);
