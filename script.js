const hh = document.getElementById("hh");
const mm = document.getElementById("mm");
const ss = document.getElementById("ss");
const rects = document.querySelectorAll(".loader rect");

let running = false;
let startTime = null;
let elapsed = 0;
let rafId = null;

function render(ms) {
  const s = Math.floor(ms / 1000);
  hh.textContent = String(Math.floor(s / 3600)).padStart(2, "0");
  mm.textContent = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  ss.textContent = String(s % 60).padStart(2, "0");
}

function start() {
  startTime = Date.now() - elapsed;
  rects.forEach(r => {
    r.style.animation = "none";
    r.offsetHeight; // force reset
    r.style.animation = "dash 1.6s linear infinite";
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
    r.style.animation = "none";
    r.style.strokeDashoffset = "0";
  });
  render(0);
}

function loop() {
  rafId = requestAnimationFrame(loop);
  elapsed = Date.now() - startTime;
  render(elapsed);
}

function saveTime(ms) {
  if (ms <= 0) return;
  const today = new Date().toISOString().slice(0, 10);
  const data = JSON.parse(localStorage.getItem("focus-time") || "{}");
  data[today] = (data[today] || 0) + ms;
  localStorage.setItem("focus-time", JSON.stringify(data));
}

/* CLICK = START / PAUSE */
document.body.addEventListener("click", () => {
  running = !running;
  running ? start() : pause();
});

/* DOUBLE CLICK = RESET */
document.body.addEventListener("dblclick", reset);

render(0);
