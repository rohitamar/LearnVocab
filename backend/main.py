from dotenv import load_dotenv 
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from pymongo import MongoClient
import requests 
from sentence_transformers import SentenceTransformer, util
import numpy as np
import math 

load_dotenv()
URI = os.getenv('URI')
DICTIONARY_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/'

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app)

client = MongoClient(URI)
words_db = client['words']['words']

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

@app.route('/insert', methods = ['POST'])
def insert_word():
    params = request.get_json()
    word = params['word'].strip().lower()

    response = requests.get(f"{DICTIONARY_URL}{word}")
    data = response.json()
    if 'title' in data:
        return jsonify({
            'status_code': 400,
            'message': f'{word} is an invalid word. Insert failed.'
        }), 400
    
    data = data[0]
    words = []

    for meaning in data['meanings']:
        partOfSpeech = meaning['partOfSpeech']
        for def_obj in meaning['definitions']:
            definition = def_obj['definition']
            embedding = model.encode([definition])[0].tolist()
            # definition_type: [0, 1]
            words.append({
                'word': word,
                'POS': partOfSpeech,
                'definition': definition,
                'embedding': embedding,
                'definition_type': 0
            })

    _ = words_db.insert_many(words)
 
    return jsonify({
        'status_code': 200,
        'message': f'Successfully inserted {word}'
    }), 200

@app.route('/words', methods = ['GET'])
def get_words():
    res = list(words_db.find({}, {'_id': 0, 'word': 1}))
    return jsonify(res)

@app.route('/checkDefinition', methods = ['POST'])
def check_definition():
    params = request.get_json()
    word, definition = params['word'], params['definition']

    def_embedding = model.encode([definition])[0]
    nearWords = words_db.aggregate([
        {
            '$vectorSearch': {
                'queryVector': def_embedding.tolist(),
                'path': 'embedding',
                'index': 'wordindex',
                'numCandidates': 1,
                'limit': 1,
                'filter': { 'word': word }
            }
        }
    ])

    verdict = False
    
    for word_obj in nearWords:
        print(word_obj['definition'])
        print(word_obj['POS'])
        v = util.pytorch_cos_sim([word_obj['embedding']], [def_embedding])[0][0]
        if v.item() > 0.6:
            verdict = True
    
    print(v) 

    return jsonify({
        'status_code': 200,
        'verdict': verdict
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=6060)