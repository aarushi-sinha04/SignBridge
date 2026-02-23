import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use refs to hold mutable variables across interval callbacks without stale state issues
  const framesBufferRef = useRef([]);
  const isTransitioningRef = useRef(false);

  // Get level from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const levelParam = queryParams.get('level');
  const [level, setLevel] = useState(levelParam ? parseInt(levelParam) : 1);

  // Level-based content lists
  const contentLists = {
    1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    2: ['busy', 'hello', 'help'], // Words our model can predict
    3: ['how are you', 'nice to meet you', 'what is your name'], // Sentences
    4: ['friend', 'family', 'home', 'school', 'work']
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamRef.current) {
        webcamRef.current.video.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setMessage('Error accessing camera. Please grant camera permissions.');
    }
  };

  const getNewWord = useCallback(() => {
    const content = contentLists[level];
    const randomIndex = Math.floor(Math.random() * content.length);
    setCurrentWord(content[randomIndex]);
    setMessage('Show this sign to the camera!');
    setIsCorrect(null);
    framesBufferRef.current = [];
    isTransitioningRef.current = false;
    setIsTransitioning(false);
  }, [level]);

  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    getNewWord();
    startCamera();
  };

  const stopCamera = () => {
    if (webcamRef.current && webcamRef.current.video) {
      const stream = webcamRef.current.video.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  };

  const stopGame = () => {
    setIsGameActive(false);
    stopCamera();
    setMessage('');
    setIsCorrect(null);
  };

  const skipWord = () => {
    getNewWord();
  };

  // Continuous capture and prediction loops
  useEffect(() => {
    let captureInterval;
    let predictInterval;

    if (isGameActive) {
      // 1. Capture loop: grabs frames quickly
      captureInterval = setInterval(() => {
        if (!isTransitioningRef.current && webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            framesBufferRef.current.push(imageSrc);

            // Maintain rolling buffer based on level
            const limit = level === 1 ? 1 : (level === 2 ? 30 : 60);
            if (framesBufferRef.current.length > limit) {
              framesBufferRef.current.shift(); // Remove oldest frame
            }
          }
        }
      }, 100);

      // 2. Predict loop: sends buffered frames to backend
      predictInterval = setInterval(async () => {
        const required = level === 1 ? 1 : (level === 2 ? 30 : 60);

        if (!isTransitioningRef.current && framesBufferRef.current.length >= required) {
          await checkSign(framesBufferRef.current);
        }
      }, 1000); // Poll backend every 1 second
    }

    return () => {
      if (captureInterval) clearInterval(captureInterval);
      if (predictInterval) clearInterval(predictInterval);
    };
  }, [isGameActive, level, currentWord]);

  const checkSign = async (framesToPredict) => {
    try {
      let endpoint = level === 1 ? '/predict/alphabet' : (level === 2 ? '/predict/word' : '/predict/sentence');

      const bodyData = level === 1
        ? { image: framesToPredict[0] }
        : { frames: framesToPredict };

      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) return;

      const data = await response.json();
      const prediction = data?.prediction?.toUpperCase();

      if (prediction === currentWord.toUpperCase()) {
        // MATCH FOUND
        isTransitioningRef.current = true;
        setIsTransitioning(true);
        setIsCorrect(true);
        setScore((prev) => prev + 10);
        setMessage('Correct! +10 points. Getting next sign...');
        await updateScoreInDB();

        // Advance automatically
        setTimeout(() => getNewWord(), 2000);
      } else if (prediction && prediction !== 'NO PREDICTION' && prediction !== 'UNRECOGNIZED') {
        // Only update UI if we have a real but incorrect prediction
        setMessage(`Detected: "${prediction}". Try again!`);
      }
    } catch (error) {
      console.error('Prediction query error:', error);
    }
  };

  const updateScoreInDB = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const updateResponse = await fetch('http://localhost:8000/api/user/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score: 10 })
      });

      if (!updateResponse.ok) return;

      const updatedData = await updateResponse.json();
      setScore(updatedData.progress.score);

      // Level up checks
      if (updatedData.progress.score >= 30 && updatedData.progress.level < 2) {
        await fetch('http://localhost:8000/api/user/unlock-level2', {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (updatedData.progress.score >= 60 && updatedData.progress.level < 3) {
        await fetch('http://localhost:8000/api/user/unlock-level3', {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-6xl mx-auto mt-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wide neon-text">Sign to Speech Challenge</h1>
          <p className="text-xl text-white/80">Level {level} - {level === 1 ? 'Alphabets' : (level === 2 ? 'Words' : 'Sentences')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Camera Box */}
          <Card className="p-6 bg-black/40 border border-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl relative">
            <div className={`aspect-video mb-6 relative rounded-lg overflow-hidden border-2 ${isCorrect ? 'border-green-500' : 'border-white/20'}`}>
              {isGameActive ? (
                <>
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    mirrored={true}
                  />
                  {/* Scanning overlay effect */}
                  {!isTransitioning && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-neon-primary/50 opacity-50 shadow-[0_0_15px_#00f3ff] animate-scan" style={{ top: '50%' }}></div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-800/80 flex flex-col items-center justify-center text-center p-4">
                  <span className="text-5xl mb-4">📷</span>
                  <p className="text-gray-400 font-medium">Camera will start when game begins</p>
                </div>
              )}
            </div>

            {!isGameActive ? (
              <Button onClick={startGame} className="w-full btn-primary text-lg py-6">
                START PLAYING
              </Button>
            ) : (
              <div className="space-y-4">
                {message && (
                  <div className={`text-center p-4 rounded-lg font-bold text-lg animate-pulse ${isCorrect === true ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                    'bg-neon-primary/10 text-neon-primary border border-neon-primary/30'
                    }`}>
                    {message}
                  </div>
                )}
                {!isTransitioning && (
                  <div className="flex items-center justify-center space-x-2 text-white/60 text-sm mt-2">
                    <div className="w-2 h-2 rounded-full bg-neon-primary animate-ping"></div>
                    <span>Auto-detecting signs...</span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Word Box */}
          <Card className="p-8 bg-black/40 border border-white/10 backdrop-blur-md rounded-xl shadow-2xl flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg border border-white/5">
                <div className="text-2xl font-bold text-white flex items-center">
                  <span className="text-yellow-400 mr-2">★</span> Score: <span className="text-neon-primary ml-2">{score}</span>
                </div>
                {isGameActive && !isTransitioning && (
                  <div className="flex space-x-2">
                    <Button onClick={skipWord} variant="outline" className="border-white/20 hover:bg-white/10 text-white font-medium bg-transparent shadow-none">
                      Skip Sign ⏭
                    </Button>
                    <Button onClick={stopGame} variant="destructive" className="bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/50 font-medium">
                      Stop ⏹
                    </Button>
                  </div>
                )}
              </div>

              {isGameActive ? (
                <div className="text-center space-y-8 py-8">
                  <h2 className="text-3xl font-semibold text-white/80">Replicate this:</h2>
                  <div className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-primary to-neon-secondary tracking-widest uppercase py-4">
                    {currentWord}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6 flex-grow flex flex-col justify-center">
                  <h2 className="text-3xl font-bold text-white">Instructions</h2>
                  <div className="space-y-4 text-white/70 text-left bg-gray-800/50 p-6 rounded-lg font-medium text-lg leading-relaxed">
                    <p>✨ Click "Start Playing" to activate your camera.</p>
                    <p>🤖 An AI model will continuously watch your hands.</p>
                    <p>🙌 Perform the exact sign requested on the screen.</p>
                    <p>🏆 Earn points automatically as soon as the sign is recognized!</p>
                  </div>
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