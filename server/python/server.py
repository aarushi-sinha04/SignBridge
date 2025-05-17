from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
from asl_predictor import ASLPredictor

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
asl_predictor = ASLPredictor()

@app.route('/predict/alphabet', methods=['POST'])
def predict_alphabet():
    try:
        # Get base64 encoded image from request
        data = request.json
        image_data = base64.b64decode(data['image'].split(',')[1])

        # Convert to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Make prediction
        prediction = asl_predictor.predict_alphabet(frame)
        print(f"Prediction: {prediction}")
        return jsonify({
            'success': True,
            'prediction': prediction
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/word', methods=['POST'])
def predict_word():
    try:
        # Get base64 encoded frames from request
        data = request.json
        frames = []

        for frame_data in data['frames']:
            image_data = base64.b64decode(frame_data.split(',')[1])
            nparr = np.frombuffer(image_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            frames.append(frame)

        # Make prediction
        prediction = asl_predictor.predict_word(frames)

        return jsonify({
            'success': True,
            'prediction': prediction
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/sentence', methods=['POST'])
def predict_sentence():
    try:
        # Get base64 encoded frames from request
        data = request.json
        frames = []

        for frame_data in data['frames']:
            image_data = base64.b64decode(frame_data.split(',')[1])
            nparr = np.frombuffer(image_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            frames.append(frame)

        # Make prediction
        prediction = asl_predictor.predict_sentence(frames)

        return jsonify({
            'success': True,
            'prediction': prediction
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)