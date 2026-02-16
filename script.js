const hh = document.getElementById("hh");
const mm = document.getElementById("mm");
const ss = document.getElementById("ss");
const rects = document.querySelectorAll(".loader rect");

const overlay = document.getElementById("overlay");
const openBtn = document.getElementById("openAnalytics");
const closeBtn = document.getElementById("closeOverlay");

const todayEl = document.getElementById("todayTime");
const weekEl = document.getElementById("weekData");
const yearEl = document.getElementById("yearData");

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

let running=false, startTime=null, elapsed=0, rafId=null;

/* TIMER */
function render(ms){
  const s=Math.floor(ms/1000);
  hh.textContent=String(Math.floor(s/3600)).padStart(2,"0");
  mm.textContent=String(Math.floor((s%3600)/60)).padStart(2,"0");
  ss.textContent=String(s%60).padStart(2,"0");
}
function start(){
  startTime=Date.now()-elapsed;
  rects.forEach(r=>r.style.animationPlayState="running");
  loop();
}
function pause(){
  cancelAnimationFrame(rafId);
  elapsed=Date.now()-startTime;
  saveTime(elapsed);
  rects.forEach(r=>r.style.animationPlayState="paused");
}
function reset(){
  cancelAnimationFrame(rafId);
  running=false; elapsed=0; startTime=null;
  rects.forEach(r=>{r.style.animationPlayState="paused"; r.style.strokeDashoffset="0";});
  render(0);
}
function loop(){
  rafId=requestAnimationFrame(loop);
  elapsed=Date.now()-startTime;
  render(elapsed);
}

/* STORAGE */
function saveTime(ms){
  if(ms<=0) return;
  const d=new Date().toISOString().slice(0,10);
  const data=JSON.parse(localStorage.getItem("focus-time")||"{}");
  data[d]=(data[d]||0)+ms;
  localStorage.setItem("focus-time",JSON.stringify(data));
}

/* ANALYTICS */
function loadAnalytics(){
  const data=JSON.parse(localStorage.getItem("focus-time")||"{}");

  const today=new Date().toISOString().slice(0,10);
  const t=data[today]||0;
  todayEl.textContent=`${Math.floor(t/3600000)}h ${Math.floor((t%3600000)/60000)}m`;

  weekEl.innerHTML="";
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const k=d.toISOString().slice(0,10);
    weekEl.innerHTML+=`<li>${d.toLocaleDateString(undefined,{weekday:"short"})}: ${Math.floor((data[k]||0)/60000)}m</li>`;
  }

  yearEl.innerHTML="";
  const months={};
  Object.keys(data).forEach(k=>{
    const m=k.slice(0,7);
    months[m]=(months[m]||0)+data[k];
  });
  Object.keys(months).forEach(m=>{
    yearEl.innerHTML+=`<li>${m}: ${Math.floor(months[m]/3600000)}h</li>`;
  });
}

/* EXPORT / IMPORT */
exportBtn.onclick=()=>{
  const data=localStorage.getItem("focus-time");
  const blob=new Blob([data],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="focus-analytics.json";
  a.click();
};

importBtn.onclick=()=>importFile.click();
importFile.onchange=e=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    if(confirm("This will overwrite existing data. Continue?")){
      localStorage.setItem("focus-time",reader.result);
      loadAnalytics();
      alert("Import successful");
    }
  };
  reader.readAsText(file);
};

/* EVENTS */
document.body.onclick=()=>{
  if(overlay.classList.contains("show")) return;
  running=!running;
  running?start():pause();
};
document.body.ondblclick=reset;

openBtn.onclick=()=>{
  loadAnalytics();
  overlay.classList.add("show");
};
closeBtn.onclick=()=>overlay.classList.remove("show");

render(0);
