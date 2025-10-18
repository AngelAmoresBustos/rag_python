import os, json, requests
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Config
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "Lrtibase")

MODEL_EMBED = "models/text-embedding-004"
DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"

# Sesión persistente para velocidad
session = requests.Session()
session.headers.update({
    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
    "Content-Type": "application/json"
})
adapter = requests.adapters.HTTPAdapter(pool_connections=10, pool_maxsize=10)
session.mount("https://", adapter)

def generate_embedding(question: str):
    client = genai.Client(api_key=GOOGLE_API_KEY)
    result = client.models.embed_content(model=MODEL_EMBED, contents=[question])
    emb = result.embeddings[0]
    return list(emb.values if hasattr(emb, "values") else emb.embedding)

def search_qdrant(vector, top_k=5):
    payload = {"vector": vector, "limit": top_k, "with_payload": True}
    headers = {"Content-Type": "application/json", "api-key": QDRANT_API_KEY}
    resp = requests.post(f"{QDRANT_URL}/collections/{QDRANT_COLLECTION}/points/search",
                         headers=headers, json=payload, timeout=20)
    resp.raise_for_status()
    return resp.json().get("result", [])

def build_context(results):
    context = ""
    for r in results:
        p = r.get("payload", {})
        context += f"\n[Chunk {p.get('chunk_index','?')}]\n{p.get('text','')}"
    return context

def ask_deepseek(prompt, context):
    messages = [
        {"role": "system", "content": "Eres un asistente legal ecuatoriano experto en la LRTI."},
        {"role": "user", "content": f"Contexto:\n{context}\n\nPregunta: {prompt}"}
    ]
    payload = {"model": DEEPSEEK_MODEL, "messages": messages, "stream": False, "temperature": 0.6}
    resp = session.post(DEEPSEEK_URL, json=payload, timeout=90)
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]

def handle_question(question: str):
    vector = generate_embedding(question)
    results = search_qdrant(vector)
    context = build_context(results)
    return ask_deepseek(question, context)
