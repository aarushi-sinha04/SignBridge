import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Webcam from 'react-webcam';

const Practice = () => {
  const { levelId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [prediction, setPrediction] = useState('');
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);
  const frameCountRef = useRef(0);

  // Content based on level
  const levelContent = {
    1: {
      title: 'Alphabets',
      items: [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
      ],
      descriptions: {
        'A': 'Make a fist with your thumb sticking out',
        'B': 'Hold your hand flat with fingers together',
        'C': 'Form a C shape with your hand',
        'D': 'Point your index finger up',
        'E': 'Make a fist with your thumb across fingers',
        'F': 'Touch your thumb to your index finger',
        'G': 'Point your index finger to the side',
        'H': 'Point your index and middle fingers to the side',
        'I': 'Pinkie finger up, other fingers down',
        'J': 'Make a J shape with your hand',
        'K': 'Index and middle fingers up, thumb out',
        'L': 'Index finger and thumb extended',
        'M': 'Three fingers down, thumb across',
        'N': 'Two fingers down, thumb across',
        'O': 'Make an O shape with your hand',
        'P': 'Index finger down, thumb out',
        'Q': 'Index finger down, thumb out, palm down',
        'R': 'Cross your index and middle fingers',
        'S': 'Make a fist with thumb across fingers',
        'T': 'Make a fist with thumb between index and middle fingers',
        'U': 'Index and middle fingers up',
        'V': 'Index and middle fingers up, spread apart',
        'W': 'Three fingers up',
        'X': 'Make an X shape with your index finger',
        'Y': 'Thumb and pinkie out',
        'Z': 'Draw a Z in the air'
      }
    },
    2: {
      title: 'Words',
      items: ['hello', 'thank you', 'please', 'sorry', 'yes', 'no', 'good', 'bad'],
      descriptions: {
        'hello': 'Wave your hand from side to side',
        'thank you': 'Touch your chin and move your hand forward',
        'please': 'Rub your chest in a circular motion',
        'sorry': 'Make a fist and rub it in a circular motion on your chest',
        'yes': 'Make a fist and nod it up and down',
        'no': 'Make a fist and shake it side to side',
        'good': 'Flat hand from mouth outward',
        'bad': 'Flat hand from mouth downward'
      }
    }
  };

  const content = levelContent[levelId] || levelContent[1];

  useEffect(() => {
    return () => {
      // Clean up when component unmounts
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopCamera();
    };
  }, []);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowWebcam(false);
    setPrediction('');
    setMessage('');
    setIsCorrect(null);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamRef.current && webcamRef.current.video) {
        webcamRef.current.video.srcObject = stream;
      }
      setShowWebcam(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setMessage('Error accessing camera. Please make sure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (webcamRef.current && webcamRef.current.video) {
      const stream = webcamRef.current.video.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
    setShowWebcam(false);
  };

  const captureFrame = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      return imageSrc;
    }
    return null;
  };

  const startRecording = () => {
    setIsRecording(true);
    setCapturedFrames([]);
    frameCountRef.current = 0;
    setMessage(`Recording... Show the sign for: ${selectedItem}`);

    intervalRef.current = setInterval(() => {
      const frame = captureFrame();
      if (frame) {
        if (parseInt(levelId) === 1) {
          // For alphabet, only keep the latest frame
          setCapturedFrames([frame]);
          frameCountRef.current += 1;

          if (frameCountRef.current >= 10) { // Capture for about 1 second
            stopRecording();
          }
        } else {
          // For words, keep accumulating frames
          setCapturedFrames(prev => [...prev, frame]);
          frameCountRef.current += 1;

          if (frameCountRef.current >= 30) { // 30 frames = 3 seconds at 10fps
            stopRecording();
          }
        }
      }
    }, 100); // ~10fps
  };

  const stopRecording = async () => {
    clearInterval(intervalRef.current);
    setIsRecording(false);

    try {
      const endpoint = parseInt(levelId) === 1 ? '/predict/alphabet' : '/predict/word';
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          parseInt(levelId) === 1
            ? { image: capturedFrames[0] }
            : { frames: capturedFrames }
        ),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const prediction = data?.prediction?.toUpperCase();
      setPrediction(prediction || 'No prediction');

      const isCorrectPrediction = prediction === selectedItem.toUpperCase();
      setIsCorrect(isCorrectPrediction);

      if (isCorrectPrediction) {
        setMessage('Correct! Great job!');
        // Here you could update score in DB if needed
      } else {
        setMessage(`Incorrect. Try again!`);
      }
    } catch (error) {
      console.error('Error checking sign:', error);
      setMessage('Error checking sign. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/learn')}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            ← Back to Learn
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Practice Sign Language {content.title}
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {content.items.map((item) => (
              <button
                key={item}
                onClick={() => handleItemClick(item)}
                className={`p-4 rounded-lg text-2xl font-bold transition-all duration-300 ${
                  selectedItem === item
                    ? 'bg-indigo-600 text-white transform scale-105'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {selectedItem && (
            <div className="mt-8 text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Sign for "{selectedItem}"
              </h2>

              {!showWebcam ? (
                <div className="space-y-6">
                  <div className="bg-gray-700 rounded-xl p-4 max-w-md mx-auto">
                    <video
                      className="w-full rounded-lg"
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src={`/assets/${selectedItem}.mp4`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <p className="text-gray-300 mt-4">
                    {content.descriptions[selectedItem] || 'No description available'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Practice with Camera
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-700 rounded-xl p-4 max-w-md mx-auto relative">
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full rounded-lg"
                    />
                    {prediction && (
                      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
                        Prediction: {prediction}
                      </div>
                    )}
                  </div>

                  {message && (
                    <div className={`p-4 rounded-lg ${isCorrect === true ? 'bg-green-800' : isCorrect === false ? 'bg-red-800' : 'bg-yellow-800'} text-white`}>
                      {message}
                    </div>
                  )}

                  <div className="flex space-x-4 justify-center">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        Start Recording
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        Stop Recording
                      </button>
                    )}
                    <button
                      onClick={stopCamera}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Close Camera
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Practice;