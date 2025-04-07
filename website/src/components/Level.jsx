import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Level = () => {
  const { levelId } = useParams();
  const { user } = useAuth();
  const [currentItem, setCurrentItem] = useState(0);
  const videoRef = useRef(null);

  // Content with actual video paths from assets
  const levelContent = {
    1: {
      title: 'Alphabets',
      items: [
        { sign: 'A', video: 'A.mp4', description: 'Make a fist with your thumb sticking out' },
        { sign: 'B', video: 'B.mp4', description: 'Hold your hand flat with fingers together' },
        { sign: 'C', video: 'C.mp4', description: 'Form a C shape with your hand' },
        { sign: 'D', video: 'D.mp4', description: 'Point your index finger up' },
        { sign: 'E', video: 'E.mp4', description: 'Make a fist with your thumb across fingers' }
      ]
    },
    2: {
      title: 'Words',
      items: [
        { sign: 'Hello', video: 'Hello.mp4', description: 'Wave your hand' },
        { sign: 'Thank You', video: 'ThankYou.mp4', description: 'Touch your chin and move forward' },
        { sign: 'Please', video: 'Please.mp4', description: 'Rub your chest in a circular motion' },
        { sign: 'Sorry', video: 'Sorry.mp4', description: 'Make a fist and rub your chest' },
        { sign: 'Goodbye', video: 'Goodbye.mp4', description: 'Wave your hand' }
      ]
    },
    3: {
      title: 'Sentences',
      items: [
        { sign: 'How are you?', video: 'HowAreYou.mp4', description: 'Combination of signs' },
        { sign: 'My name is...', video: 'MyNameIs.mp4', description: 'Combination of signs' },
        { sign: 'Nice to meet you', video: 'NiceToMeetYou.mp4', description: 'Combination of signs' },
        { sign: 'I love you', video: 'ILoveYou.mp4', description: 'Combination of signs' },
        { sign: 'What is your name?', video: 'WhatIsYourName.mp4', description: 'Combination of signs' }
      ]
    }
  };

  const content = levelContent[levelId] || levelContent[1];
  const currentSign = content.items[currentItem];

  const handleNext = () => {
    if (currentItem < content.items.length - 1) {
      setCurrentItem(currentItem + 1);
    }
  };

  const handlePrevious = () => {
    if (currentItem > 0) {
      setCurrentItem(currentItem - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/learn')}
            className="text-neon-primary hover:text-neon-secondary font-medium flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Learn
          </button>
        </div>

        <div className="glass-card mb-8">
          <h2 className="text-2xl font-bold mb-4 gradient-text">{content.title}</h2>
          <p className="text-white/80">Select a sign to learn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.items.map((item, index) => (
            <div
              key={index}
              className="glass-card group cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate(`/practice/${levelId}/${index}`)}
            >
              <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src={item.video}
                  loop
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white/80 text-sm">{item.description}</p>
                </div>
              </div>
              <h3 className="text-xl font-bold gradient-text">{item.sign}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Level; 