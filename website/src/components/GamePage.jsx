import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import Webcam from 'react-webcam';

const GamePage = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [timer, setTimer] = useState(30);
  const [isGameActive, setIsGameActive] = useState(false);
  const [level, setLevel] = useState(1);

  // Level-based content lists
  const contentLists = {
    1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    2: ['hello', 'thank you', 'goodbye', 'yes', 'no'],
    3: ['please', 'sorry', 'help', 'water', 'food'],
    4: ['friend', 'family', 'home', 'school', 'work']
  };

  useEffect(() => {
    let interval;
    if (isGameActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      stopRecording();
      getNewWord();
      setTimer(30);
    }
    return () => clearInterval(interval);
  }, [isGameActive, timer]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamRef.current) {
        webcamRef.current.video.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setMessage('Error accessing camera. Please make sure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (webcamRef.current) {
      const stream = webcamRef.current.video.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  };

  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    setTimer(30);
    getNewWord();
    startCamera();
  };

  const getNewWord = () => {
    const content = contentLists[level];
    const randomIndex = Math.floor(Math.random() * content.length);
    setCurrentWord(content[randomIndex]);
    setMessage('');
    setIsCorrect(null);
  };

  const startRecording = () => {
    setIsRecording(true);
    setCapturedFrames([]);
    setMessage(`Recording... Show the sign for: ${currentWord}`);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (capturedFrames.length > 0) {
      await checkSign();
    }
  };

  const captureFrame = () => {
    if (webcamRef.current && isRecording) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedFrames((prev) => [...prev, imageSrc]);
      }
    }
  };

  useEffect(() => {
    let frameInterval;
    if (isRecording) {
      frameInterval = setInterval(captureFrame, 100); // Capture every 100ms
    }
    return () => clearInterval(frameInterval);
  }, [isRecording]);

  const checkSign = async () => {
    try {
      const endpoint = level === 1 ? '/predict/alphabet' : '/predict/word';
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(level === 1 ? { image: capturedFrames[0] } : { frames: capturedFrames }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Sign data:', data);
      const prediction = data?.prediction?.toUpperCase();
      console.log('Prediction:', prediction);
      console.log('Current Word:', currentWord);
      const isCorrectPrediction = prediction === currentWord.toUpperCase();
      
      setIsCorrect(isCorrectPrediction);
      if (isCorrectPrediction) {
        setScore((prev) => prev + 10);
        setMessage('Correct! +10 points');
      } else {
        setMessage(`Incorrect. The sign was for "${currentWord}"`);
      }

      // Move to next word after a delay
      setTimeout(() => {
        getNewWord();
        setTimer(300);
      }, 20000);
    } catch (error) {
      console.error('Error checking sign:', error);
      setMessage('Error checking sign. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Sign Language Game</h1>
          <p className="text-xl text-gray-600">Level {level} - {level === 1 ? 'Alphabets' : 'Words'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="aspect-video mb-4">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            
            {!isGameActive ? (
              <Button onClick={startGame} className="w-full">
                Start Game
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">Score: {score}</span>
                  <span className="text-xl">Time: {timer}s</span>
                </div>
                
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">{currentWord}</h2>
                  {message && (
                    <p className={`text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {message}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  {!isRecording ? (
                    <Button onClick={startRecording} className="flex-1">
                      Start Recording
                    </Button>
                  ) : (
                    <Button onClick={stopRecording} className="flex-1">
                      Stop Recording
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Click "Start Game" to begin</li>
              <li>• Position yourself in front of the camera</li>
              <li>• When you see {level === 1 ? 'an alphabet' : 'a word'}, click "Start Recording"</li>
              <li>• Show the sign for {level === 1 ? 'the alphabet' : 'the word'}</li>
              <li>• Click "Stop Recording" when done</li>
              <li>• You have 30 seconds for each attempt</li>
              <li>• Earn 10 points for each correct sign</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GamePage; 