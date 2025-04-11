
import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
import pickle
from tensorflow.keras.models import load_model
from collections import deque

# Load models
word_model = load_model('asl_lstm_model.h5')
alphabet_model = load_model('asl_alphabet_model.h5')

# Load label encoder
with open('label_encoder.pkl', 'rb') as f:
    label_encoder = pickle.load(f)

# MediaPipe hands
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)

# Buffer to hold keypoints for LSTM
sequence = deque(maxlen=30)

def extract_keypoints(results):
    if results.multi_hand_landmarks:
        hand = results.multi_hand_landmarks[0]
        return np.array([[lm.x, lm.y, lm.z] for lm in hand.landmark]).flatten()
    else:
        return np.zeros(21 * 3)

# Webcam
cap = cv2.VideoCapture(0)
print("Webcam started. Press 'q' to quit.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Flip and convert
    image = cv2.flip(frame, 1)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(image_rgb)

    # Draw hand landmarks
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)

    # Extract keypoints
    keypoints = extract_keypoints(results)
    sequence.append(keypoints)

    # Prediction
    if len(sequence) == 1:
        input_data = np.expand_dims(sequence[0], axis=0)
        prediction = alphabet_model.predict(input_data)[0]
        pred_class = np.argmax(prediction)
        confidence = prediction[pred_class]
        label = chr(65 + pred_class) if confidence > 0.9 else ""
    elif len(sequence) == 30:
        input_data = np.expand_dims(sequence, axis=0)
        prediction = word_model.predict(input_data)[0]
        pred_class = np.argmax(prediction)
        confidence = prediction[pred_class]
        label = label_encoder.inverse_transform([pred_class])[0] if confidence > 0.7 else ""
    else:
        label = ""

    # Display label
    cv2.putText(image, f'{label}', (30, 80), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3)

    # Show image
    cv2.imshow('ASL Real-time', image)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
