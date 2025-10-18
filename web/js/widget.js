(function() {
  // Crear botón flotante
  const button = document.createElement("button");
  button.textContent = "💬";
  Object.assign(button.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "9999",
    padding: "12px 18px",
    background: "#0077cc",
    color: "white",
    border: "none",
    borderRadius: "50%",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    cursor: "pointer",
    fontSize: "16px"
  });
  document.body.appendChild(button);

  // Crear contenedor del widget
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "400px",
    height: "600px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    zIndex: "9998",
    display: "none",
    overflow: "hidden"
  });

  // Botón de cierre "X"
  const closeBtn = document.createElement("div");
  closeBtn.textContent = "✖";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "8px",
    right: "18px",
    fontSize: "20px",
    cursor: "pointer",
    color: "#555",
    zIndex: "10000"
  });
  closeBtn.addEventListener("click", () => {
    container.style.display = "none";
  });

  // Iframe del asistente
  const iframe = document.createElement("iframe");
  iframe.src = "https://angelamores.com/rag_web/index.html";
  Object.assign(iframe.style, {
    width: "100%",
    height: "100%",
    border: "none",
    borderRadius: "12px"
  });

  container.appendChild(closeBtn);
  container.appendChild(iframe);
  document.body.appendChild(container);

  // Mostrar/ocultar el widget
  button.addEventListener("click", () => {
    container.style.display = container.style.display === "none" ? "block" : "none";
  });
})();
