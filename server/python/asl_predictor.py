import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model, model_from_json, Sequential
from tensorflow.keras.layers import Input, LSTM, Dense, Dropout, TimeDistributed, Bidirectional, Masking
import mediapipe as mp
import joblib
import os
import h5py
import json

def remove_time_major_from_config(config):
    if isinstance(config, dict):
        if 'time_major' in config:
            del config['time_major']
        for key in config:
            if isinstance(config[key], (dict, list)):
                config[key] = remove_time_major_from_config(config[key])
    elif isinstance(config, list):
        for i, item in enumerate(config):
            if isinstance(item, (dict, list)):
                config[i] = remove_time_major_from_config(item)
    return config

def build_model_from_config(config):
    if config['class_name'] == 'Sequential':
        model = Sequential(name=config['config']['name'])
        input_shape = None
        
        # Find input shape from the first layer
        for layer_config in config['config']['layers']:
            if layer_config['class_name'] == 'InputLayer':
                input_shape = layer_config['config']['batch_input_shape'][1:]
                break
            elif 'batch_input_shape' in layer_config['config']:
                input_shape = layer_config['config']['batch_input_shape'][1:]
                break
        
        # Add layers
        first_layer = True
        for layer_config in config['config']['layers']:
            if layer_config['class_name'] == 'InputLayer':
                continue  # Skip input layer as it will be inferred
                
            layer_cls = getattr(tf.keras.layers, layer_config['class_name'])
            layer_config = layer_config['config']
            
            # Remove batch_input_shape from non-first layers
            if not first_layer and 'batch_input_shape' in layer_config:
                del layer_config['batch_input_shape']
            
            # Add input_shape to the first layer if we have it
            if first_layer and input_shape is not None:
                layer_config['input_shape'] = input_shape
                if 'batch_input_shape' in layer_config:
                    del layer_config['batch_input_shape']
            
            layer = layer_cls.from_config(layer_config)
            model.add(layer)
            first_layer = False
            
        return model
    else:
        return tf.keras.models.model_from_json(json.dumps(config))

class ASLPredictor:
    def __init__(self):
        
        # Initialize MediaPipe
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Get the absolute path to the model directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.dirname(os.path.dirname(current_dir))
        model_dir = os.path.join(root_dir, 'model')
        
        # Load models
        try:
            # Load alphabet model
            
            alphabet_model_path = os.path.join(model_dir, 'cnn_model_keras2.h5')
            

            try:
                with h5py.File(alphabet_model_path, 'r') as f:
                    model_config = f.attrs['model_config']
                    if isinstance(model_config, bytes):
                        model_config = model_config.decode('utf-8')
                    model_config = json.loads(model_config)
                    model_config = remove_time_major_from_config(model_config)
                    self.alphabet_model = build_model_from_config(model_config)
                    self.alphabet_model.load_weights(alphabet_model_path)
                    print("Expected input shape:", self.alphabet_model.input_shape)
                    self.alphabet_model.summary()
                    print("Alphabet model loaded successfully")
            except Exception as e:
                print(f"Error loading alphabet model: {str(e)}")
                raise

            
            # Load word model
            word_model_path = os.path.join(model_dir, 'asl_lstm_model.h5')
            word_model_json_path = os.path.join(model_dir, 'asl_lstm_model.json')
            try:
                with open(word_model_json_path, 'r') as json_file:
                    model_json = json_file.read()
                    model_config = json.loads(model_json)
                    model_config = remove_time_major_from_config(model_config)
                    self.word_model = build_model_from_config(model_config)
                    self.word_model.load_weights(word_model_path)
                    print("Word model loaded successfully using JSON config")
            except Exception as e:
                print(f"Error loading word model with JSON config: {str(e)}")
                try:
                    with h5py.File(word_model_path, 'r') as f:
                        model_config = f.attrs['model_config']
                        if isinstance(model_config, bytes):
                            model_config = model_config.decode('utf-8')
                        model_config = json.loads(model_config)
                        model_config = remove_time_major_from_config(model_config)
                        self.word_model = build_model_from_config(model_config)
                        self.word_model.load_weights(word_model_path)
                        print("Word model loaded successfully using h5py")
                except Exception as e:
                    print(f"Error loading word model with h5py: {str(e)}")
                    raise
                    
        except Exception as e:
            print(f"Error loading models: {str(e)}")
            raise
            
        # Load label encoder
        label_encoder_path = os.path.join(model_dir, 'label_encoder.pkl')
        self.label_encoder = joblib.load(label_encoder_path)

    def preprocess_frame(self, frame):
        # Convert frame to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process frame with MediaPipe
        results = self.hands.process(rgb_frame)
        
        if not results.multi_hand_landmarks:
            return None
            
        # Extract hand landmarks
        landmarks = []
        for hand_landmarks in results.multi_hand_landmarks:
            for landmark in hand_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
        
        landmarks = np.array(landmarks)

        # Normalize the landmarks (optional based on training)
        # Example: min-max normalization
        landmarks -= np.min(landmarks)
        landmarks /= np.ptp(landmarks)  # ptp = max - min

        return landmarks
    

   
    def predict_alphabet(self, frame):
        # Save the input frame (optional, for debugging)
        cv2.imwrite("input_frame.jpg", frame)

        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Resize to match model input size
        resized = cv2.resize(gray, (50, 50))  # or (28, 28) if that’s your training size

        # Normalize and reshape for model input
        input_img = resized.reshape(1, 50, 50, 1).astype('float32') / 255.0

        print("✅ Input image shape:", input_img.shape)

        # Labels
        alphabet_labels = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'space', 'del', 'nothing', 'additional_gesture_1', 'additional_gesture_2', 'additional_gesture_3', 'additional_gesture_4'
        ]


        # Predict
        try:
            prediction = self.alphabet_model.predict(input_img)
            print("📈 Prediction output:", prediction)

            predicted_class = np.argmax(prediction)

            if predicted_class < len(alphabet_labels):
                predicted_label = alphabet_labels[predicted_class]
                print("✅ Predicted label:", predicted_label)
                return predicted_label
            else:
                print("⚠️ Invalid predicted index")
                return None

        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return None






# original
    # def predict_alphabet(self, frame):
    #     cv2.imwrite("input_frame.jpg", frame)

    #     landmarks = self.preprocess_frame(frame)
    #     if landmarks is None:
    #         print("No hand detected in the frame")
    #         return None
            
    #     # Reshape for model input
    #     landmarks = landmarks.reshape(1, 1, -1)
    #     print("Alphabet landmarks shape:", landmarks.shape)

        
    #     # Make prediction
    #     try:
    #         prediction = self.alphabet_model.predict(landmarks)
    #         print("Prediction output:", prediction)
    #         predicted_class = np.argmax(prediction)

    #         alphabet_labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 
    #                         'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 
    #                         'W', 'X', 'Y', 'Z', 'space', 'del', 'nothing']
    #         print("Predicted class:", predicted_class)
    #         print("Predicted label:", alphabet_labels[predicted_class])

    #         return alphabet_labels[predicted_class]
        
    #     except Exception as e:
    #         print(f"Prediction error: {e}")
    #         return None

    # def predict_alphabet(self, frame):
    #     # Convert to grayscale
    #     gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
    #     # Resize to match model input size
    #     resized = cv2.resize(gray, (28, 28))

    #     # Normalize and reshape to match model input shape (1, 28, 28, 1)
    #     reshaped = resized.reshape(1, 28, 28, 1).astype('float32') / 255.0

    #     # Predict
    #     prediction = self.alphabet_model.predict(reshaped)
    #     predicted_class = np.argmax(prediction)

    #     # Corrected label list
    #     alphabet_labels = [
    #         'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    #         'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    #         'space', 'del', 'nothing'
    #     ]

    #     return alphabet_labels[predicted_class]


    def predict_word(self, frames):
        # Preprocess frames
        landmarks = []
        for frame in frames:
            frame_landmarks = self.preprocess_frame(frame)
            if frame_landmarks is not None:
                landmarks.append(frame_landmarks)
        
        if not landmarks:
            return None
            
        # Pad or truncate to 30 frames
        landmarks = np.array(landmarks)
        if len(landmarks) < 30:
            landmarks = np.pad(landmarks, ((0, 30 - len(landmarks)), (0, 0)))
        else:
            landmarks = landmarks[:30]
            
        # Reshape for model input
        landmarks = landmarks.reshape(1, 30, -1)
        
        # Make prediction
        prediction = self.word_model.predict(landmarks)
        predicted_class = np.argmax(prediction)
        
        # Convert to word using label encoder
        return self.label_encoder.inverse_transform([predicted_class])[0]

    def release(self):
        self.hands.close() 