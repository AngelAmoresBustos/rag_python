from flask import Flask, request, jsonify
from rag_engine import handle_question

app = Flask(__name__)

@app.route("/ping")
def ping():
    return jsonify({"status": "ok"})

@app.route("/query", methods=["POST"])
def query():
    data = request.get_json()
    question = data.get("question", "")
    answer = handle_question(question)
    return jsonify({"answer": answer})
