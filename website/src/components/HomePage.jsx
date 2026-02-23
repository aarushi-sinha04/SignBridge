import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-16 mt-[-4rem]">
          <h1 className="text-6xl font-bold mb-6 gradient-text">Welcome to SignBridge</h1>
          <p className="text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Your immersive journey to master sign language through interactive AI tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="glass-card hover:-translate-y-2 transition-transform duration-500 flex flex-col h-full border-neon-secondary/20">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
              <span className="text-neon-secondary mr-3">📚</span> Learn
            </h2>
            <p className="text-gray-400 mb-8 text-lg flex-grow">
              Start your journey by learning individual alphabets, essential words, and complex sentences.
            </p>
            <button
              onClick={() => navigate('/learn')}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg py-4 rounded-xl transition-all duration-300 border border-white/10"
            >
              Start Learning
            </button>
          </div>

          <div className="glass-card hover:-translate-y-2 transition-transform duration-500 flex flex-col h-full border-neon-primary/20 shadow-[0_0_30px_rgba(0,255,157,0.1)] relative overflow-hidden">

            <h2 className="text-3xl font-bold text-white mb-4 flex items-center z-10 relative">
              <span className="text-neon-primary mr-3">🎮</span> Play
            </h2>
            <p className="text-gray-400 mb-8 text-lg flex-grow z-10 relative">
              Test your skills with our interactive continuous AI camera tracking game. Show the signs and earn points!
            </p>
            <button
              onClick={() => navigate('/game')}
              className="btn-primary w-full text-black font-bold text-lg py-4 rounded-xl transition-all z-10 relative"
            >
              START PLAYING
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;