# RAG App — Búsqueda Augmentada (RAG) con Python, Qdrant, Gemini y Deepseek

> Proyecto: motor RAG para la Ley de Régimen Tributario Interno (Ecuador) con widget embebible en páginas web.

## 🔎 Resumen
Esta aplicación implementa un flujo **Retrieval-Augmented Generation (RAG)** que combina:
- **Qdrant** para almacenamiento y búsqueda por similaridad de vectores (chunks de texto).  
- **Gemini** (embedding) para convertir la pregunta del usuario en vectores.  
- **Deepseek** como paso de re-ranker o consolidación que recibe los chunks más relevantes junto al prompt system y la pregunta.  
- **Frontend web** (HTML/CSS/Vanilla JS) que muestra el resultado en la fuente original (página web) y permite embeber un widget (`widget.js`) para usar el motor desde cualquier sitio.

El dataset indexado en Qdrant son **chunks** extraídos de la **Ley de Régimen Tributario Interno del Ecuador**. El flujo devuelve los 10 chunks más relevantes, los procesa con Deepseek y entrega el resultado final mostrado en la web.

---

## 📁 Estructura del proyecto (`rag_app`)

```
rag_app/
├── app/
│   ├── main.py           # App principal / punto de arranque (API / CLI según diseño)
│   └── rag_engine.py     # Lógica RAG: embeddings con Gemini, query a Qdrant y llamada a Deepseek
│
└── web/
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── app.js        # Lógica cliente para comunicación con el backend / widget
    │   └── widget.js     # Widget embebible para incluir en cualquier web
    ├── index.html
    ├── iframe.html       # Vista pensada para cargar dentro de un iframe
    └── embebido.html     # Ejemplo de página que usa widget.js
```

---

## ⚙️ Flujo de trabajo (alto nivel)

1. El usuario en la web ingresa una **pregunta** (widget o interfaz web).  
2. `main.py` / `rag_engine.py` toman la pregunta y solicitan embeddings a **Gemini**.  
3. Se realiza una **consulta por similaridad** en **Qdrant** usando el vector de la pregunta; Qdrant devuelve los **10 chunks** más cercanos.  
4. Los 10 chunks se envían a **Deepseek** junto con un **prompt system** (instrucciones/contexto) y la pregunta del usuario para obtener una respuesta consolidada o re-rankeada.  
5. El resultado final se reenvía a la **fuente original** (la página web que originó la consulta) y se presenta al usuario.  
6. Además existe un `widget.js` que permite embeber esta funcionalidad desde cualquier otra web.

---

## 🛠️ Requisitos y dependencias (sugeridas)

- Python 3.8+
- Paquetes Python (ejemplo):
  - `requests`
  - `qdrant-client`
  - `openai` o librería cliente para **Gemini** (según proveedor)
  - Cliente / SDK para **Deepseek** (si existe) o `requests` para llamadas HTTP
  - `flask` o `fastapi` (si expones endpoints desde `main.py`)
- Qdrant (self-host o Qdrant Cloud) con colección creada e indexada con embeddings de los chunks
- Credenciales/API keys para Gemini y Deepseek

> Añade un `requirements.txt` en el repositorio con las dependencias concretas que uses.

---

## 🧩 Detalles técnicos importantes

### `app/rag_engine.py` (funcionalidad principal)
- **Entrada:** string `pregunta` del usuario.
- **Paso 1:** Llamada a Gemini para obtener embeddings del texto. (ej. `embed = gemini.embed(pregunta)`)
- **Paso 2:** Query a Qdrant (`search` / `retrieve`) usando `embed`, pidiendo top_k=10. Qdrant devuelve `chunks` y metadatos (fuente, offset, URL).
- **Paso 3:** Construir prompt para Deepseek que incluya:
  - `system prompt` (instrucciones del rol, contexto legal, estilo de respuesta)
  - `chunks` (los 10 retornados, ordenados por similitud)
  - `user prompt` (la pregunta original)
- **Paso 4:** Llamada a Deepseek, obtener la respuesta consolidada / re-rankeada / resumida.
- **Salida:** respuesta lista para ser devuelta al frontend y mostrada en la página que originó la consulta.


### Qdrant
- Asegúrate de usar la **métrica** adecuada (cosine o dot) y la misma configuración de embeddings que usó Gemini.
- Guarda metadatos útiles por chunk: `source_url`, `document_id`, `chunk_index`, `text`, `title`.
- Indexa vectores con un id consistente para facilitar actualizaciones/inserciones.

### Deepseek
- Usar Deepseek como re-ranker/rewriter mejora la calidad final: envía los chunks y una instrucción clara para que produzca una respuesta concisa y referenciada.
- Limita el texto enviado (ej. truncar o priorizar por score) para no exceder límites de prompt.

---

## 🧭 Cómo ejecutar (ejemplo rápido)

> **NOTA:** Los comandos reales dependen de cómo hayas implementado `main.py` y los clientes. A continuación un ejemplo orientativo.

1. Crea entorno virtual e instala dependencias:

```bash
python -m venv venv
source venv/bin/activate     # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

2. Exporta variables de entorno (ejemplo):
```bash
export QDRANT_URL="http://localhost:6333"
export QDRANT_API_KEY="tu_qdrant_key"
export GEMINI_API_KEY="tu_gemini_key"
export DEEPSEEK_API_KEY="tu_deepseek_key"
export FLASK_ENV=development
```

3. Inicia la app (si `main.py` expone una API):
```bash
python app/main.py
```

4. Abre `web/index.html` en tu navegador o sirves la carpeta `web/` con un servidor estático (ej. `python -m http.server 8080`) y prueba `embebido.html` o `iframe.html`.

---

## 🧪 Ejemplos de uso (ejemplo conceptual en pseudocódigo)

```python
# uso simplificado
from app.rag_engine import handle_question

engine = handle_question(question)
resp = engine.query("¿Cuál es la tasa de impuesto a la renta para personas naturales según la ley?")
print(resp.text)
# resp puede contener: texto, referencias a chunks, fuente original (URL)
```

## 🚀 Despliegue y producción (sugerencias)

- Para producción considera desplegar la API con `gunicorn` o `uvicorn` (si usas FastAPI) detrás de **NGINX**.
- Qdrant en producción debería correr en un servicio gestionado o en una VM con recursos suficientes para búsquedas vectoriales.
- Añade monitorización (prometheus/grafana) y logging estructurado.
- Considera caché para queries frecuentes o resultados reusables.

---

## 📦 Archivos clave y su propósito

- `app/main.py` — Punto de arranque; expone endpoints HTTP (p. ej. `/query`) y recibe peticiones desde `widget.js` o `app.js`.
- `app/rag_engine.py` — Implementa: embeddings (Gemini) → búsqueda Qdrant → llamada Deepseek → construcción de la respuesta.
- `web/index.html` — Interfaz demo local para probar la integración.
- `web/iframe.html` — Plantilla preparada para cargar respuestas dentro de un iframe.
- `web/embebido.html` — Ejemplo de cómo incluir `widget.js` en un sitio externo.
- `web/js/widget.js` — Widget embebible; envía la pregunta al backend y visualiza la respuesta en la web origen.
- `web/js/app.js` — Lógica cliente para la demo / integraciones.
- `web/css/style.css` — Estilos de la demo.

---

## 📚 Referencias y lecturas recomendadas

- Documentación de **Qdrant**: https://qdrant.tech  
- Documentación de **Gemini embeddings** (o el proveedor de embeddings que uses)  
- Documentación de **Deepseek** (API y límites)  
- Artículos sobre **RAG (Retrieval-Augmented Generation)**

---

## 📝 Licencia
Este proyecto puede distribuirse bajo la **MIT License** (ajusta según prefieras).

---

## ✍️ Autor
Angel Amores — *Software Engineer*

---
