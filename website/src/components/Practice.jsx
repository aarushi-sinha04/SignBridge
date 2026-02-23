import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Webcam from 'react-webcam';

const Practice = () => {
  const { levelId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedItem, setSelectedItem] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const webcamRef = useRef(null);
  const framesBufferRef = useRef([]);
  const isTransitioningRef = useRef(false);

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
  const levelInt = parseInt(levelId);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowWebcam(false);
    setPrediction('');
    setMessage('');
    setIsCorrect(null);
    framesBufferRef.current = [];
    isTransitioningRef.current = false;
    setIsTransitioning(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamRef.current && webcamRef.current.video) {
        webcamRef.current.video.srcObject = stream;
      }
      setShowWebcam(true);
      setMessage('Show the sign to the camera!');
      setIsCorrect(null);
      setPrediction('');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setMessage('Error accessing camera. Please grant camera permissions.');
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

  // Continuous prediction loop when webcam is active
  useEffect(() => {
    let captureInterval;
    let predictInterval;

    if (showWebcam && !isTransitioningRef.current) {
      captureInterval = setInterval(() => {
        if (!isTransitioningRef.current && webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            framesBufferRef.current.push(imageSrc);

            const limit = levelInt === 1 ? 1 : 30; // 30 frames for words
            if (framesBufferRef.current.length > limit) {
              framesBufferRef.current.shift();
            }
          }
        }
      }, 100);

      predictInterval = setInterval(async () => {
        const required = levelInt === 1 ? 1 : 30;
        if (!isTransitioningRef.current && framesBufferRef.current.length >= required) {
          await checkSign(framesBufferRef.current);
        }
      }, 1000); // Check every 1s
    }

    return () => {
      if (captureInterval) clearInterval(captureInterval);
      if (predictInterval) clearInterval(predictInterval);
    };
  }, [showWebcam, levelInt, selectedItem]);

  const checkSign = async (frames) => {
    try {
      const endpoint = levelInt === 1 ? '/predict/alphabet' : '/predict/word';
      const bodyData = levelInt === 1 ? { image: frames[0] } : { frames: frames };

      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) return;

      const data = await response.json();
      const currentPrediction = data?.prediction?.toUpperCase() || '';

      if (currentPrediction && currentPrediction !== 'NO PREDICTION' && currentPrediction !== 'UNRECOGNIZED') {
        setPrediction(currentPrediction);

        if (currentPrediction === selectedItem.toUpperCase()) {
          // Success!
          isTransitioningRef.current = true;
          setIsTransitioning(true);
          setIsCorrect(true);
          setMessage('Correct! Great job!');

          setTimeout(() => {
            stopCamera();
          }, 3000);
        } else {
          setMessage(`Detected: "${currentPrediction}". Keep trying!`);
          setIsCorrect(false);
        }
      }
    } catch (error) {
      console.error('Error checking sign:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mt-16">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/learn')}
            className="text-neon-primary hover:text-neon-secondary font-medium transition-colors flex items-center"
          >
            ← Back to Learn
          </button>
        </div>

        <div className="glass-card p-8 border border-white/10 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-6 text-center neon-text tracking-wide">
            Practice Sign Language: <span className="text-neon-primary">{content.title}</span>
          </h1>

          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4 mb-10 p-4 bg-black/40 rounded-xl overflow-y-auto max-h-60 border border-white/5">
            {content.items.map((item) => (
              <button
                key={item}
                onClick={() => handleItemClick(item)}
                className={`p-3 rounded-lg text-xl font-bold transition-all duration-300 ${selectedItem === item
                  ? 'bg-neon-primary text-black transform scale-110 shadow-[0_0_15px_#00f3ff]'
                  : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-neon-primary/50 border border-transparent'
                  }`}
              >
                {item}
              </button>
            ))}
          </div>

          {selectedItem && (
            <div className="text-center bg-black/40 p-8 rounded-xl border border-white/10 relative overflow-hidden">
              <h2 className="text-3xl font-semibold text-white mb-6">
                Practice: <span className="text-neon-primary uppercase tracking-wider text-4xl">{selectedItem}</span>
              </h2>

              {!showWebcam ? (
                <div className="space-y-6">
                  <div className="bg-gray-900/80 rounded-xl p-4 max-w-lg mx-auto border border-white/10 shadow-lg">
                    {/* Placeholder for video file. Usually you'd load /assets/item.mp4 */}
                    <video
                      className="w-full rounded-lg"
                      controls autoPlay loop muted playsInline
                    >
                      <source src={`/assets/${selectedItem}.mp4`} type="video/mp4" />
                      Video not found for this sign.
                    </video>
                  </div>

                  <div className="max-w-md mx-auto p-4 bg-gray-800/50 rounded-lg border border-white/5">
                    <p className="text-gray-300 font-medium text-lg leading-relaxed">
                      {content.descriptions[selectedItem] || 'Mimic the sign above!'}
                    </p>
                  </div>

                  <button
                    onClick={startCamera}
                    className="w-full btn-primary text-lg py-4 mt-4"
                  >
                    📸 Practice with Camera
                  </button>
                </div>
              ) : (
                <div className="space-y-6 flex flex-col items-center">
                  <div className={`relative max-w-lg w-full bg-gray-900/80 rounded-xl overflow-hidden border-2 transition-colors duration-500 shadow-2xl ${isCorrect === true ? 'border-green-500 shadow-[0_0_30px_#22c55e]' :
                    isCorrect === false ? 'border-red-500/50' : 'border-neon-primary/50'
                    }`}>

                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full object-cover"
                      mirrored={true}
                    />

                    {!isTransitioning && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-neon-primary/60 shadow-[0_0_15px_#00f3ff] animate-scan" style={{ top: '50%' }}></div>
                    )}

                    {prediction && (
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-lg font-bold border border-white/20">
                        AI Sees: <span className={prediction === selectedItem.toUpperCase() ? 'text-green-400' : 'text-neon-primary'}>{prediction}</span>
                      </div>
                    )}
                  </div>

                  {message && (
                    <div className={`px-6 py-3 rounded-full text-lg font-bold border ${isCorrect === true ? 'bg-green-500/20 text-green-400 border-green-500/50' : isCorrect === false ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-neon-primary/20 text-neon-primary border-neon-primary/50'}`}>
                      {message}
                    </div>
                  )}

                  {!isTransitioning && (
                    <div className="flex items-center space-x-2 text-white/50 text-sm mt-2">
                      <div className="w-2 h-2 rounded-full bg-neon-primary animate-ping"></div>
                      <span>Auto-detecting...</span>
                    </div>
                  )}

                  <div className="pt-4 w-full px-12">
                    <button
                      onClick={stopCamera}
                      className="w-full py-4 rounded-xl bg-red-500/20 text-red-500 font-bold hover:bg-red-500/40 transition-colors border border-red-500/50 text-lg shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    >
                      Stop Practice ⏹
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