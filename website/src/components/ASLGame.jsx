import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

const ASLGame = ({ level, onComplete, onScoreUpdate }) => {
    const [score, setScore] = useState(0);
    const [currentWord, setCurrentWord] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [prediction, setPrediction] = useState('');
    const [frames, setFrames] = useState([]);
    const webcamRef = useRef(null);
    const intervalRef = useRef(null);
    const frameCountRef = useRef(0);

    // Words for level 2
    const words = ['HELLO', 'THANK YOU', 'PLEASE', 'SORRY', 'YES', 'NO', 'GOOD', 'BAD'];

    useEffect(() => {
        if (level === 1) {
            // Generate random alphabet for level 1
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            setCurrentWord(alphabet[Math.floor(Math.random() * alphabet.length)]);
        } else {
            // Generate random word for level 2
            setCurrentWord(words[Math.floor(Math.random() * words.length)]);
        }
    }, [level]);

    const captureFrame = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            return imageSrc;
        }
        return null;
    };

    const startRecording = () => {
        setIsRecording(true);
        setFrames([]);
        frameCountRef.current = 0;

        intervalRef.current = setInterval(() => {
            const frame = captureFrame();
            if (frame) {
                setFrames(prev => [...prev, frame]);
                frameCountRef.current += 1;

                if (frameCountRef.current >= 30) { // 30 frames = 1 second at 30fps
                    stopRecording();
                }
            }
        }, 33); // ~30fps
    };

    const stopRecording = async () => {
        clearInterval(intervalRef.current);
        setIsRecording(false);

        try {
            const response = await fetch(`/api/asl/predict/${level === 1 ? 'alphabet' : 'word'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    [level === 1 ? 'image' : 'frames']: level === 1 ? frames[0] : frames
                }),
            });

            const data = await response.json();
            if (data.success) {
                setPrediction(data.prediction);
                
                // Check if prediction matches current word
                if (data.prediction === currentWord) {
                    const newScore = score + 1;
                    setScore(newScore);
                    onScoreUpdate(newScore);
                    
                    // Generate new word
                    if (level === 1) {
                        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                        setCurrentWord(alphabet[Math.floor(Math.random() * alphabet.length)]);
                    } else {
                        setCurrentWord(words[Math.floor(Math.random() * words.length)]);
                    }
                }
            }
        } catch (error) {
            console.error('Error making prediction:', error);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-bold">Level {level}</h2>
            <p className="text-xl">Current Word: {currentWord}</p>
            <p className="text-xl">Score: {score}</p>
            
            <div className="relative">
                <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded-lg"
                />
                {prediction && (
                    <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
                        Prediction: {prediction}
                    </div>
                )}
            </div>

            <div className="space-x-4">
                <button
                    onClick={startRecording}
                    disabled={isRecording}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
                >
                    Start Recording
                </button>
                <button
                    onClick={stopRecording}
                    disabled={!isRecording}
                    className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
                >
                    Stop Recording
                </button>
            </div>
        </div>
    );
};

export default ASLGame; 