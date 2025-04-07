import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Practice = () => {
  const { levelId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [loading, setLoading] = useState(true);

  const alphabet = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z'
  ];

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
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
            Practice Sign Language Alphabet
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                className={`p-4 rounded-lg text-2xl font-bold transition-all duration-300 ${
                  selectedLetter === letter
                    ? 'bg-indigo-600 text-white transform scale-105'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          {selectedLetter && (
            <div className="mt-8 text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Sign for "{selectedLetter}"
              </h2>
              <div className="bg-gray-700 rounded-xl p-4 max-w-md mx-auto">
                <video
                  className="w-full rounded-lg"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src={`/assets/${selectedLetter}.mp4`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-gray-300 mt-4">
                {getLetterDescription(selectedLetter)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getLetterDescription = (letter) => {
  const descriptions = {
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
  };

  return descriptions[letter] || 'No description available';
};

export default Practice; 