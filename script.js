/* ===== EXISTING CODE ABOVE STAYS SAME ===== */

/* EXPORT / IMPORT (SAFE ADDITION) */
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

exportBtn.addEventListener("click", () => {
  const data = localStorage.getItem("focus-time");
  if (!data) {
    alert("No data to export");
    return;
  }
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "focus-analytics.json";
  a.click();
});

importBtn.addEventListener("click", () => {
  importFile.click();
});

importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    if (confirm("This will overwrite existing analytics. Continue?")) {
      localStorage.setItem("focus-time", reader.result);
      loadAnalytics(); // refresh analytics safely
      alert("Import successful");
    }
  };
  reader.readAsText(file);
});
