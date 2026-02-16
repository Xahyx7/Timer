const hh = document.getElementById("hh");
const mm = document.getElementById("mm");
const ss = document.getElementById("ss");
const loaders = document.querySelectorAll(".loader-box");

let running = false;
let startTime = null;
let elapsed = 0;
let rafId = null;

/* 🔁 UPDATE DISPLAY */
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

/* 🔄 LOOP */
function loop() {
  rafId = requestAnimationFrame(loop);
  elapsed = Date.now() - startTime;
  render(elapsed);
}

/* 💾 SAVE TO LOCALSTORAGE (BY DATE) */
function saveTime(ms) {
  const today = new Date().toISOString().slice(0, 10);
  const data = JSON.parse(localStorage.getItem("focus-time") || "{}");
  data[today] = (data[today] || 0) + ms;
  localStorage.setItem("focus-time", JSON.stringify(data));
}

/* 🖱️ CLICK ANYWHERE */
document.body.addEventListener("click", () => {
  running = !running;
  running ? start() : pause();
});

/* ⏪ LOAD TODAY (OPTIONAL) */
render(0);
