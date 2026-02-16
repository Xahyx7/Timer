const hh = document.getElementById("hh");
const mm = document.getElementById("mm");
const ss = document.getElementById("ss");
const loaders = document.querySelectorAll(".loader-box");

let running = false;
let startTime = null;
let elapsed = 0;
let rafId = null;

/* 🔁 RENDER TIME */
function render(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  hh.textContent = String(hours).padStart(2, "0");
  mm.textContent = String(minutes).padStart(2, "0");
  ss.textContent = String(seconds).padStart(2, "0");
}

/* ▶️ START */
function start() {
  startTime = Date.now() - elapsed;
  loaders.forEach(l => l.style.animationPlayState = "running");
  loop();
}

/* ⏸️ PAUSE */
function pause() {
  cancelAnimationFrame(rafId);
  elapsed = Date.now() - startTime;
  saveTime(elapsed);
  loaders.forEach(l => l.style.animationPlayState = "paused");
}

/* 🔄 RESET */
function reset() {
  cancelAnimationFrame(rafId);
  running = false;
  elapsed = 0;
  startTime = null;
  loaders.forEach(l => l.style.animationPlayState = "paused");
  render(0);
}

/* 🔁 LOOP */
function loop() {
  rafId = requestAnimationFrame(loop);
  elapsed = Date.now() - startTime;
  render(elapsed);
}

/* 💾 SAVE TIME */
function saveTime(ms) {
  if (ms <= 0) return;
  const today = new Date().toISOString().slice(0, 10);
  const data = JSON.parse(localStorage.getItem("focus-time") || "{}");
  data[today] = (data[today] || 0) + ms;
  localStorage.setItem("focus-time", JSON.stringify(data));
}

/* 🖱️ CLICK = START / PAUSE */
document.body.addEventListener("click", () => {
  running = !running;
  running ? start() : pause();
});

/* 🔁 DOUBLE CLICK = RESET */
document.body.addEventListener("dblclick", () => {
  reset();
});

/* INIT */
render(0);
