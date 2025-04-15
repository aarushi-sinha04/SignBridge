from flask import Flask, request, jsonify
from flask_cors import CORS 
import cv2
import numpy as np
import base64
import mediapipe as mp
from tensorflow.keras.models import load_model
from sklearn.preprocessing import LabelEncoder
import os

app = Flask(__name__)
# Configure CORS with specific settings
CORS(app, resources={
    r"/predict/*": {
        "origins": ["http://localhost:5173"],  # Your frontend URL
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

class ASLPredictor:
    def __init__(self):
        # Initialize MediaPipe Hands
        self.hands = mp.solutions.hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.5
        )
        
        # Load the word model
        model_path = os.path.join('model_words', 'asl_word_lstm_model.h5')
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
            
        self.model = load_model(model_path)
        
        # Initialize label encoder for words
        self.label_encoder = LabelEncoder()
        self.label_encoder.fit(['hello', 'help', 'busy'])  # Words in your dataset
        
    def predict_word(self, frames):
        try:
            # Extract landmarks from frames
            landmarks = []
            for frame in frames:
                # Convert to RGB for MediaPipe
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = self.hands.process(rgb_frame)
                
                if results.multi_hand_landmarks:
                    # Get the first hand's landmarks
                    hand_landmarks = results.multi_hand_landmarks[0]
                    # Convert landmarks to a flat array
                    landmark_data = []
                    for landmark in hand_landmarks.landmark:
                        landmark_data.extend([landmark.x, landmark.y, landmark.z])
                    landmarks.append(landmark_data)
            
            if not landmarks:
                return None
                
            # Convert to numpy array and reshape
            landmarks_array = np.array(landmarks)
            landmarks_array = landmarks_array.reshape(landmarks_array.shape[0], 1, landmarks_array.shape[1])
            
            # Make prediction
            prediction = self.model.predict(landmarks_array)
            predicted_class = np.argmax(prediction, axis=1)
            
            # Get the most common prediction
            from collections import Counter
            most_common = Counter(predicted_class).most_common(1)
            final_prediction = most_common[0][0] if most_common else None
            
            if final_prediction is None:
                return None
                
            # Convert prediction index to word
            return self.label_encoder.inverse_transform([final_prediction])[0]
            
        except Exception as e:
            print(f"Error in predict_word: {str(e)}")
            return None

asl_predictor = ASLPredictor()

@app.route('/predict/alphabet', methods=['POST', 'OPTIONS'])
def predict_alphabet():
    if request.method == 'OPTIONS':
        return '', 200
        
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
        data = request.get_json()
        if not data or 'frames' not in data:
            return jsonify({'error': 'No frames provided'}), 400

        frames = data['frames']
        if not frames:
            return jsonify({'error': 'Empty frames array'}), 400

        decoded_frames = []
        for i, frame in enumerate(frames):
            try:
                if frame.startswith('data:image/jpeg;base64,'):
                    frame = frame.split(',')[1]
                image_data = base64.b64decode(frame)
                nparr = np.frombuffer(image_data, np.uint8)
                cv_frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if cv_frame is None:
                    raise ValueError(f"Failed to decode frame {i}")
                decoded_frames.append(cv_frame)
            except Exception as e:
                return jsonify({'error': f'Error decoding frame {i}: {str(e)}'}), 400

        if len(decoded_frames) == 0:
            return jsonify({'error': 'No valid frames after decoding'}), 400

        # ✅ Use the predictor method instead of manual processing
        prediction = asl_predictor.predict_word(decoded_frames)
        if prediction is None:
            return jsonify({'error': 'Prediction failed'}), 500

        return jsonify({'prediction': prediction})

    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001) 