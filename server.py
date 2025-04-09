from flask import Flask, request, jsonify
from flask_cors import CORS
from asl_predictor import ASLPredictor
import numpy as np
import cv2
import base64

app = Flask(__name__)

# Configure CORS with specific settings
CORS(app, resources={
    r"/predict/*": {
        "origins": ["http://localhost:5173"],  # Your frontend URL
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

predictor = ASLPredictor()

@app.route('/predict/alphabet', methods=['POST', 'OPTIONS'])
def predict_alphabet():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
            
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Predict
        prediction = predictor.predict_alphabet(image)
        return jsonify({'prediction': prediction})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/word', methods=['POST', 'OPTIONS'])
def predict_word():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        frames = data.get('frames', [])
        
        if not frames:
            return jsonify({'error': 'No frames provided'}), 400
            
        # Decode frames
        decoded_frames = []
        for frame in frames:
            image_bytes = base64.b64decode(frame.split(',')[1])
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            decoded_frames.append(image)
            
        # Predict
        prediction = predictor.predict_word(decoded_frames)
        return jsonify({'prediction': prediction})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) 