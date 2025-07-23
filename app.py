from flask import Flask, render_template, request, jsonify
from textblob import TextBlob
import traceback

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze_text', methods=['POST']) # New endpoint for text analysis
def analyze_text():
    print("Received request to /analyze_text")

    # Expect JSON data with a 'text' field
    data = request.get_json()
    if not data or 'text' not in data:
        print("Error: No 'text' field in JSON data.")
        return jsonify({'error': 'No text provided for analysis'}), 400

    text = data['text']
    print(f"Received text for analysis: '{text}'")

    if not text.strip(): # Check if text is empty or just whitespace
        print("Warning: Received empty text, returning neutral mood.")
        return jsonify({
            'text': text,
            'sentiment_score': 0.0,
            'mood': 'Neutral'
        })

    try:
        # Perform sentiment analysis using TextBlob
        analysis = TextBlob(text)
        sentiment_score = analysis.sentiment.polarity
        print(f"Sentiment polarity: {sentiment_score}")

        # Determine mood based on sentiment score
        mood = "Neutral"
        if sentiment_score > 0.1:
            mood = "Good" # Positive sentiment
        elif sentiment_score < -0.1:
            mood = "Bad" # Negative sentiment
        
        # Optional: Add "Sad" for very strong negative sentiment if desired
        # if sentiment_score < -0.5:
        #     mood = "Bad (Sad)"

        print(f"Determined mood: {mood}")

        return jsonify({
            'text': text,
            'sentiment_score': sentiment_score,
            'mood': mood
        })

    except Exception as e:
        print("\n--- UNEXPECTED SERVER ERROR ---")
        print(f"An unexpected error occurred during text analysis: {e}")
        print("Full Python Traceback:")
        traceback.print_exc()
        print("-------------------------------\n")
        return jsonify({'error': f'An unexpected error occurred: {e}'}), 500

