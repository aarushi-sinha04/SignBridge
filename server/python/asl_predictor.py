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
            max_num_hands=2,  # Changed to detect both hands
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
            alphabet_model_path = os.path.join(model_dir, 'asl_alphabet_model.h5')


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

            # Load word model from Model_words directory
            word_model_dir = os.path.join(model_dir, 'Model_words')
            word_model_path = os.path.join(word_model_dir, 'asl_word_lstm_model.h5')
            word_label_encoder_path = os.path.join(word_model_dir, 'label_encoder.pkl')

            try:
                # Load the word model directly
                self.word_model = tf.keras.models.load_model(word_model_path)
                print("Word model loaded successfully from Model_words directory")

                # Load the word label encoder
                self.word_label_encoder = joblib.load(word_label_encoder_path)
                print("Word label encoder loaded successfully")
            except Exception as e:
                print(f"Error loading word model from Model_words: {str(e)}")
                raise

            # Load sentence model from model_sentences directory
            sentence_model_dir = os.path.join(model_dir, 'model_sentences')
            sentence_model_path = os.path.join(sentence_model_dir, 'asl_sentence_model_final.h5')
            sentence_model_architecture_path = os.path.join(sentence_model_dir, 'asl_sentence_model_architecture.json')
            sentence_label_encoder_path = os.path.join(sentence_model_dir, 'label_encoder_sentences.pkl')

            try:
                # Load the sentence model directly
                self.sentence_model = tf.keras.models.load_model(sentence_model_path)
                print("Sentence model loaded successfully from model_sentences directory")

                # Load the sentence label encoder
                self.sentence_label_encoder = joblib.load(sentence_label_encoder_path)
                print("Sentence label encoder loaded successfully")
            except Exception as e:
                print(f"Error loading sentence model from model_sentences: {str(e)}")
                raise

        except Exception as e:
            print(f"Error loading models: {str(e)}")
            raise

        # Load label encoder
        label_encoder_path = os.path.join(model_dir, 'label_encoder.pkl')
        self.label_encoder = joblib.load(label_encoder_path)

    def preprocess_frame(self, frame, num_hands=2):
        # Convert frame to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Process frame with MediaPipe
        results = self.hands.process(rgb_frame)

        if not results.multi_hand_landmarks:
            return None

        # Extract hand landmarks
        landmarks = []

        if num_hands == 1:
            hand_landmarks = results.multi_hand_landmarks[0]
            for landmark in hand_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
        else:
            # Check if we have both hands
            if len(results.multi_hand_landmarks) >= 2:
                # Process both hands
                for i in range(2):
                    hand_landmarks = results.multi_hand_landmarks[i]
                    hand_data = []
                    for landmark in hand_landmarks.landmark:
                        hand_data.extend([landmark.x, landmark.y, landmark.z])
                    landmarks.extend(hand_data)
            else:
                # Process one hand and pad with zeros for the second hand
                for hand_landmarks in results.multi_hand_landmarks:
                    for landmark in hand_landmarks.landmark:
                        landmarks.extend([landmark.x, landmark.y, landmark.z])

                # If we only have one hand, pad with zeros for the second hand
                # Each hand has 21 landmarks with x, y, z coordinates (63 values)
                if len(landmarks) == 63:  # One hand detected
                    landmarks.extend([0.0] * 63)  # Pad with zeros for the second hand

        landmarks = np.array(landmarks)

        # Normalize the landmarks
        if np.ptp(landmarks) > 0:  # Avoid division by zero
            landmarks -= np.min(landmarks)
            landmarks /= np.ptp(landmarks)  # ptp = max - min

        return landmarks

    def predict_alphabet(self, frame):
        cv2.imwrite("input_frame.jpg", frame)

        landmarks = self.preprocess_frame(frame, num_hands=1)
        if landmarks is None:
            print("No hand detected in the frame")
            return None

        # Reshape for model input
        landmarks = landmarks.reshape(1, 1, -1)
        print("Alphabet landmarks shape:", landmarks.shape)


        # Make prediction
        try:
            prediction = self.alphabet_model.predict(landmarks)
            print("Prediction output:", prediction)
            predicted_class = np.argmax(prediction)

            predicted_index = np.argmax(prediction)
            predicted_label = self.label_encoder.inverse_transform([predicted_index])[0]
            return predicted_label




        except Exception as e:
            print(f"Prediction error: {e}")
            return None

    def predict_word(self, frames):
        landmarks = []
        for frame in frames:
            frame_landmarks = self.preprocess_frame(frame, num_hands=2)
            if frame_landmarks is not None:
                landmarks.append(frame_landmarks)

        if not landmarks:
            print("No hand detected in any of the frames")
            return None

        # Pad or truncate to 30 frames
        landmarks = np.array(landmarks)
        print(f"Original landmarks shape: {landmarks.shape}")

        if len(landmarks) < 30:
            # Pad with zeros to reach 30 frames
            pad_width = ((0, 30 - len(landmarks)), (0, 0))
            landmarks = np.pad(landmarks, pad_width, mode='constant')
        else:
            # Truncate to 30 frames
            landmarks = landmarks[:30]

        # Reshape for model input (batch_size, sequence_length, features)
        landmarks = landmarks.reshape(1, 30, -1)
        print(f"Word landmarks shape for model input: {landmarks.shape}")

        # Make prediction
        try:
            prediction = self.word_model.predict(landmarks)
            print(f"Word prediction output: {prediction}")
            predicted_class = np.argmax(prediction)

            # Convert to word using word label encoder
            predicted_word = self.word_label_encoder.inverse_transform([predicted_class])[0]
            print(f"Predicted word: {predicted_word}")
            return predicted_word
        except Exception as e:
            print(f"Word prediction error: {e}")
            return None

    def predict_sentence(self, frames):
        landmarks = []
        for frame in frames:
            frame_landmarks = self.preprocess_frame(frame, num_hands=2)
            if frame_landmarks is not None:
                landmarks.append(frame_landmarks)

        if not landmarks:
            print("No hand detected in any of the frames")
            return None

        # Pad or truncate to 60 frames
        landmarks = np.array(landmarks)
        print(f"Original landmarks shape: {landmarks.shape}")

        if len(landmarks) < 60:
            # Pad with zeros to reach 60 frames
            pad_width = ((0, 60 - len(landmarks)), (0, 0))
            landmarks = np.pad(landmarks, pad_width, mode='constant')
        else:
            # Truncate to 60 frames
            landmarks = landmarks[:60]

        # Reshape for model input (batch_size, sequence_length, features)
        landmarks = landmarks.reshape(1, 60, -1)
        print(f"Sentence landmarks shape for model input: {landmarks.shape}")

        # Make prediction
        try:
            prediction = self.sentence_model.predict(landmarks)
            print(f"Sentence prediction output: {prediction}")
            predicted_class = np.argmax(prediction)

            # Convert to sentence using sentence label encoder
            predicted_sentence = self.sentence_label_encoder.inverse_transform([predicted_class])[0]
            print(f"Predicted sentence: {predicted_sentence}")
            return predicted_sentence
        except Exception as e:
            print(f"Sentence prediction error: {e}")
            return None

    def release(self):
        self.hands.close()