import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import Webcam from 'react-webcam';

const GamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const webcamRef = useRef(null);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [showWord, setShowWord] = useState(true);
  const [isGameActive, setIsGameActive] = useState(false);

  // Get level from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const levelParam = queryParams.get('level');
  const [level, setLevel] = useState(levelParam ? parseInt(levelParam) : 1);

  // Level-based content lists
  const contentLists = {
    1: ['A', 'B', 'C', 'D', 'E', 'F'],
    2: ['busy', 'hello', 'help'], // Only the three words our model can predict
    3: ['how are you', 'nice to meet you', 'what is your name'], // Only the three sentences our model can predict
    4: ['friend', 'family', 'home', 'school', 'work']
  };

  useEffect(() => {
    let frameInterval;
    if (isRecording) {
      frameInterval = setInterval(captureFrame, 100);
    }
    return () => {
      if (frameInterval) clearInterval(frameInterval);
    };
  }, [isRecording]);

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
    getNewWord();
    startCamera();
  };

  const getNewWord = () => {
    const content = contentLists[level];
    const randomIndex = Math.floor(Math.random() * content.length);
    setCurrentWord(content[randomIndex]);
    setShowWord(true);
    setIsRecording(false);
    setCapturedFrames([]);
    setMessage('');
    setIsCorrect(null);
  };

  const startRecording = () => {
    setShowWord(false);
    setIsRecording(true);
    setCapturedFrames([]);
    setMessage(`Recording... Show the sign for: ${currentWord}`);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (level === 1) {
      // For alphabet, we only need one frame
      if (capturedFrames.length > 0) {
        await checkSign();
      } else {
        setMessage('No frame captured. Please try again.');
      }
    } else {
      // For words, we need multiple frames
      if (capturedFrames.length >= 30) {
        await checkSign();
      } else {
        setMessage(`Need ${30 - capturedFrames.length} more frames. Please try again.`);
      }
    }
  };

  const captureFrame = () => {
    if (webcamRef.current && isRecording) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        if (level === 1) {
          // For alphabet, only keep the latest frame
          setCapturedFrames([imageSrc]);
        } else {
          // For words, keep accumulating frames
          setCapturedFrames((prev) => [...prev, imageSrc]);
        }
      }
    }
  };

  const skipWord = () => {
    getNewWord();
  };

  const checkSign = async () => {
    try {
      let endpoint;
      if (level === 1) {
        endpoint = '/predict/alphabet';
      } else if (level === 2) {
        endpoint = '/predict/word';
      } else if (level === 3) {
        endpoint = '/predict/sentence';
      }

      console.log('Using endpoint:', endpoint);
      console.log('Level:', level);
      console.log('Captured frames:', capturedFrames.length);

      console.log('Sending request to:', `http://localhost:5001${endpoint}`);
      console.log('Request body:', level === 1 ? { image: 'base64 image data...' } : { frames: `${capturedFrames.length} frames` });

      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(level === 1 ? { image: capturedFrames[0] } : { frames: capturedFrames }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const prediction = data?.prediction?.toUpperCase();
      const isCorrectPrediction = prediction === currentWord.toUpperCase();

      setIsCorrect(isCorrectPrediction);
      if (isCorrectPrediction) {
        setScore((prev) => prev + 10);
        setMessage('Correct! +10 points');
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

      // Update score by adding 10 points
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

      // Update local score state with the new score from DB
      setScore(updatedData.progress.score);

      // Check if we should unlock level 2
      if (updatedData.progress.score >= 30 && updatedData.progress.level < 2) {
        // Try to unlock level 2
        const unlockResponse = await fetch('http://localhost:8000/api/user/unlock-level2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (unlockResponse.ok) {
          setMessage('Congratulations! You have unlocked the Words level!');
          // Refresh the page to ensure all components update
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }

      // Check if we should unlock level 3
      if (updatedData.progress.score >= 60 && updatedData.progress.level < 3) {
        // Try to unlock level 3
        const unlockResponse = await fetch('http://localhost:8000/api/user/unlock-level3', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (unlockResponse.ok) {
          setMessage('Congratulations! You have unlocked the Sentences level!');
          // Refresh the page to ensure all components update
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error in updateScoreInDB:', error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-whitemb-4">Sign Language Game</h1>
          <p className="text-xl text-white/80">Level {level} - {level === 1 ? 'Alphabets' : level === 2 ? 'Words' : 'Sentences'}</p>
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
                  <Button onClick={skipWord} variant="outline">Skip Word</Button>
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
                    <li>• When you see {level === 1 ? 'an alphabet' : level === 2 ? 'a word' : 'a sentence'}, click "Start Recording"</li>
                    <li>• Show the sign for {level === 1 ? 'the alphabet' : level === 2 ? 'the word' : 'the sentence'}</li>
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

export default GamePage;