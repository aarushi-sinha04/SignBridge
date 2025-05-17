# SignBridge

SignBridge is an innovative web application designed to bridge communication between spoken and sign language. It features real-time speech-to-sign conversion and an interactive American Sign Language (ASL) learning game powered by machine learning.

## Features

### 1. Speech to Sign Language
- Converts spoken English into sign language in real-time.
- Uses Web Speech API (`webkitSpeechRecognition`) to transcribe speech.
- Renders sign animations/images corresponding to the words detected.

### 2. ASL Learning Game
- Levels:
  - Alphabets
  - Words
  - Sentences
- Practice Mode: Webcam-based sign recognition to check user input.
- Uses a trained CNN+LSTM model (`model.h5`) for gesture recognition.
- Real-time feedback with score tracking.

### 3. User Authentication & Progress Tracking
- Users can sign up/log in.
- Learning progress saved in MongoDB.
- Frontend built using React for smooth page transitions.

## Tech Stack

- **Frontend**: React, Tailwind CSS  
- **Gesture Detection**: OpenCV, MediaPipe Hands  
- **Machine Learning Model**: TensorFlow, Keras, integrated with OpenCV and MediaPipe  
- **Speech Recognition**: `webkitSpeechRecognition` (Browser API)  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB  


## Model Architecture (CNN + LSTM)

- **CNN**: Extracts spatial features from hand images.
- **LSTM**: Models temporal sequence of hand movements across 30 frames.
- **Output**: Predicts ASL gesture as one of the 26 English alphabets.

## Installation

### Prerequisites

- Node.js and npm (for the frontend and backend)
- MongoDB (for user authentication and progress tracking)
- Python 3.6+ (for training and running the machine learning model)
- TensorFlow and Keras (for the CNN+LSTM model)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/signbridge.git
cd signbridge
````

### 2. Install Frontend Dependencies

```bash
cd website
npm install
npm run dev
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
npm run start
```

### 4. Start the Python ML Server


```bash
cd ../python
python server.py
```

* Make sure you have the `model.h5` file available for the CNN+LSTM model.
* Run the model inference scripts as needed.

## Usage

1. Open the application in your browser (typically `http://localhost:5173` for the frontend).
2. Use the microphone button to start speech-to-text recognition, and see the corresponding ASL animation.
3. Start the ASL learning game and practice recognition with your webcam.

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Install dependencies, work on your feature, and write tests if needed.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.




