import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv 
import os
from pymongo import MongoClient

with open('words.txt', 'r') as f:
    lines = [line.strip() for line in f.readlines()]
    words = [w for i, w in enumerate(lines) if i % 2 == 0]
    print(words)
    load_dotenv()
    URI = os.getenv('URI')

    client = MongoClient(URI)
    words_db = client['words']['words']

    words = list(map(lambda x : {'word': x}, words))
    words_db.insert_many(words)