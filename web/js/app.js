const historyData = [];

document.getElementById("sendBtn").addEventListener("click", () => {
  const question = document.getElementById("question").value.trim();
  const responseDiv = document.getElementById("response");
  const historyDiv = document.getElementById("history");

  if (!question) {
    responseDiv.textContent = "⚠️ Por favor, escribe una pregunta.";
    return;
  }

  const phrases = [
    "Consultando jurisprudencia relevante…",
    "Buscando en la base legal…",
    "Analizando precedentes tributarios…",
    "Verificando normativa vigente…",
    "Explorando artículos aplicables…"
  ];

  let phraseIndex = 0;
  let phraseInterval;

  function startLoadingAnimation() {
    const loadingDiv = document.getElementById("loading");
    loadingDiv.innerHTML = `
      <div class="spinner"></div>
      <p id="loadingPhrase">${phrases[0]}</p>
    `;
    loadingDiv.classList.remove("hidden");

    phraseInterval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      document.getElementById("loadingPhrase").textContent = phrases[phraseIndex];
    }, 2000);
  }

  function stopLoadingAnimation() {
    clearInterval(phraseInterval);
    phraseIndex = 0;
    const loadingDiv = document.getElementById("loading");
    loadingDiv.classList.add("hidden");
    loadingDiv.innerHTML = "";
  }

  startLoadingAnimation();

  responseDiv.textContent = "";

  fetch("https://angelamores.com/rag/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "question":question })
  })
  .then(res => {
    if (!res.ok) throw new Error("Error en la respuesta del servidor");
    return res.json();
  })
  .then(data => {
    responseDiv.textContent = `✅ Respuesta:\n${data.answer}`;

const item = document.createElement("div");
item.className = "accordion-item";

const header = document.createElement("div");
header.className = "accordion-header";
header.textContent = `❓ ${question}`;

const content = document.createElement("div");
content.className = "accordion-content";
content.innerHTML = `
  ✅ ${data.answer}
  <button class="copy-btn">Copiar</button>
`;

const copyBtn = content.querySelector(".copy-btn");
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(data.answer)
    .then(() => alert("Respuesta copiada al portapapeles"))
    .catch(() => alert("Error al copiar"));
});

header.addEventListener("click", () => {
  content.style.display = content.style.display === "none" ? "block" : "none";
});

item.appendChild(header);
item.appendChild(content);
historyDiv.prepend(item);

// Guardar en historial para exportar
historyData.push({ question, answer: data.answer });

    stopLoadingAnimation();

  })
  .catch(err => {
    stopLoadingAnimation();

    responseDiv.textContent = `❌ Error: ${err.message}`;
  });
});


document.getElementById("exportBtn").addEventListener("click", () => {
  if (historyData.length === 0) {
    alert("No hay historial para exportar.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Pregunta,Respuesta\n";

  historyData.forEach(entry => {
    const q = entry.question.replace(/"/g, '""');
    const a = entry.answer.replace(/"/g, '""');
    csvContent += `"${q}","${a}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "historial_consultas.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
