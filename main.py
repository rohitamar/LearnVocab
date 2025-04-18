from dotenv import load_dotenv
from datetime import datetime, timezone
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import os
from pymongo import MongoClient
import random

load_dotenv()
URI = os.getenv('URI')
GEMINI_API = os.getenv('GEMINI_API')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

print(f"Using Gemini model {GEMINI_API}")

build_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'build')
app = Flask(__name__,
            static_folder=build_dir,
            static_url_path='')

CORS(app)

client = MongoClient(URI)
words_db = client['words']['words']

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(
    model_name=GEMINI_API,
    generation_config={
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }
)
chat_session = model.start_chat(history=[])

with open('prompt.txt', 'r') as f:
    lines = [line.strip() for line in f.readlines()]
    template_prompt = " ".join(lines)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    return send_from_directory(app.static_folder,
                               path or 'index.html')

@app.route('/insertWord', methods = ['POST'])
def insert_word():
    params = request.get_json()
    word = params['word'].strip().lower()
    _ = words_db.insert_one({
        'word': word
    })
    return jsonify({
        'status_code': 200,
        'message': f'Successfully inserted {word}'
    }), 200

@app.route('/words', methods = ['GET'])
def get_words():
    response = words_db.find({}, {'_id': 0, 'word': 1})
    words = list(map(lambda x : x['word'], response)) 
    random.shuffle(words)
    return jsonify({
        'words': words
    })

@app.route('/checkDefinition', methods = ['POST'])
def check_definition():
    global template_prompt
    params = request.get_json()
    word, definition = params['word'], params['definition']

    prompt = f"{template_prompt} WORD={word}, DEFINITION={definition}"
    response = chat_session.send_message(prompt)

    score = response.text.strip()
    score = float(score) 

    words_db.update_one({
        "word": word
    },
    {
        "$push": {
            "wordDefinitions": {
                "definition": definition,
                "score": score,
                "date": datetime.now(timezone.utc)
            }
        }
    })
    
    return jsonify({
        'status_code': 200,
        'score': score
    }), 200

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=6060)