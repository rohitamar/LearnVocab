from dotenv import load_dotenv 
from flask import Flask, jsonify, request
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

app = Flask(__name__)
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

    nmr = response.text.strip()
    nmr = float(nmr) 
    print(nmr) 
    
    return jsonify({
        'status_code': 200,
        'verdict': nmr >= 0.75
    }), 200

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=6060)