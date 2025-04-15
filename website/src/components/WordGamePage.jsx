import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import Webcam from 'react-webcam';

const WordGamePage = () => {
  const webcamRef = useRef(null);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [showWord, setShowWord] = useState(true);
  const [isGameActive, setIsGameActive] = useState(false);
  const [level, setLevel] = useState(2);
  const [countdown, setCountdown] = useState(null);

  // Words for level 2
  const words = ['hello', 'help', 'busy'];
  const frameInterval = useRef(null);
  const countdownInterval = useRef(null);

  useEffect(() => {
    if (isRecording) {
      frameInterval.current = setInterval(captureFrame, 100); // Capture at 10fps
    }
    return () => {
      if (frameInterval.current) {
        clearInterval(frameInterval.current);
      }
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, [isRecording]);

  const startCountdown = () => {
    setCountdown(3);
    setMessage('Get ready...');
    
    countdownInterval.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          startActualRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startActualRecording = () => {
    setShowWord(false);
    setIsRecording(true);
    setCapturedFrames([]);
    setMessage(`Recording... Show the sign for: ${currentWord}`);
  };

  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    getNewWord();
  };

  const getNewWord = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    setCurrentWord(words[randomIndex]);
    setShowWord(true);
    setIsRecording(false);
    setCapturedFrames([]);
    setMessage('');
    setIsCorrect(null);
    setCountdown(null);
  };

  const startRecording = () => {
    startCountdown();
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (frameInterval.current) {
      clearInterval(frameInterval.current);
    }

    if (capturedFrames.length >= 30) {
      await checkSign();
    } else {
      setMessage(`Need ${30 - capturedFrames.length} more frames. Please try again.`);
    }
  };

  const captureFrame = () => {
    if (webcamRef.current && isRecording) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedFrames(prev => [...prev, imageSrc]);
      }
    }
  };

  const checkSign = async () => {
    try {
      console.log('Captured frames length:', capturedFrames.length);
      console.log('First frame:', capturedFrames[0]?.substring(0, 50) + '...');
      
      const response = await fetch('http://localhost:5001/predict/word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          frames: capturedFrames.slice(0, 30) // Send exactly 30 frames
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(`Network response was not ok: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      // Check if prediction exists and is valid
      if (!data.prediction) {
        console.error('No prediction received from server:', data);
        setMessage('Error: Could not process the sign. Please try again.');
        return;
      }

      const prediction = data.prediction.toLowerCase();
      const isCorrectPrediction = prediction === currentWord.toLowerCase();
      
      setIsCorrect(isCorrectPrediction);
      if (isCorrectPrediction) {
        setMessage('Correct! +10 points');
        setScore(prev => prev + 10);
        await updateScoreInDB();
      } else {
        setMessage(`Incorrect. The sign was for "${currentWord}"`);
      }

      // Move to next word after a delay
      setTimeout(() => {
        getNewWord();
      }, 2000);
    } catch (error) {
      console.error('Error checking sign:', error);
      setMessage('Error checking sign. Please try again.');
    }
  };

  const updateScoreInDB = async () => {
    try {
      console.log('Updating score in DB');
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      const updateResponse = await fetch('http://localhost:8000/api/user/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score: 10 // Points to add for each correct word
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Error updating score:', errorData);
        throw new Error('Failed to update score');
      }

      const updatedData = await updateResponse.json();
      console.log('Score update response:', updatedData);
      setScore(updatedData.progress.score);
    } catch (error) {
      console.error('Error in updateScoreInDB:', error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Words Level</h1>
          <p className="text-xl text-white/80">Practice signing words</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Camera Box */}
          <Card className="p-6">
            <div className="aspect-video mb-4">
              {isGameActive ? (
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Camera will start when game begins</p>
                </div>
              )}
            </div>
            
            {!isGameActive ? (
              <Button onClick={startGame} className="w-full">
                Start Game
              </Button>
            ) : (
              <div className="space-y-4">
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
                {countdown !== null && (
                  <div className="text-center text-6xl font-bold text-neon-primary">
                    {countdown}
                  </div>
                )}
                {message && (
                  <div className={`text-center p-4 rounded-lg ${
                    isCorrect === true ? 'bg-green-100 text-green-800' :
                    isCorrect === false ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Word Box */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">Score: {score}</div>
                {isGameActive && (
                  <Button onClick={getNewWord} variant="outline">Skip Word</Button>
                )}
              </div>

              {isGameActive ? (
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Show this sign:</h2>
                  <div className="text-6xl font-bold text-blue-600">{currentWord}</div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Instructions</h2>
                  <ul className="space-y-2 text-gray-600 text-left">
                    <li>• Click "Start Game" to begin</li>
                    <li>• Position yourself in front of the camera</li>
                    <li>• When you see a word, click "Start Recording"</li>
                    <li>• A 3-second countdown will begin</li>
                    <li>• Show the sign for the word</li>
                    <li>• Click "Stop Recording" when done</li>
                    <li>• Earn 10 points for each correct sign</li>
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WordGamePage; 