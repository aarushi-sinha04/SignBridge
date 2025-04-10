import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Learn = () => {
  const { user } = useAuth();

  const levels = [
    {
      id: 1,
      title: 'Level 1: Alphabets',
      description: 'Master the fundamental building blocks of sign language',
      locked: false
    },
    {
      id: 2,
      title: 'Level 2: Words',
      description: 'Learn essential words and their sign language representations',
      locked: true
    },
    {
      id: 3,
      title: 'Level 3: Sentences',
      description: 'Combine signs to form meaningful sentences',
      locked: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Learn Sign Language</h1>
          <p className="text-xl text-white/80">Begin your journey to master sign language</p>
        </div>

        <div className="mb-12">
          <Link
            to="/practice/1"
            className="block group/btn"
          >
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-primary/30 via-neon-secondary/30 to-neon-accent/30 rounded-lg blur opacity-0 group-hover/btn:opacity-100 transition duration-300"></div>
              <button className="relative w-full px-8 py-6 bg-black/40 backdrop-blur-sm text-white rounded-lg font-medium transition-all duration-300 group-hover/btn:bg-black/60 border border-white/10 group-hover/btn:border-neon-primary/80 text-2xl">
                Let's Practice First!
              </button>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`glass-card group ${level.locked ? 'opacity-50' : 'hover:scale-105'}`}
            >
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-bold mb-2 gradient-text">{level.title}</h3>
                <p className="text-white/80 mb-4">{level.description}</p>
                <div className="mt-auto">
                  {level.locked ? (
                    <div className="flex items-center text-white/60">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Locked
                    </div>
                  ) : (
                    <Link
                      to="/HomePage"
                      className="btn-primary w-full text-center"
                    >
                      Start Learning
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-6">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Current Streak</h3>
              <p className="text-3xl font-bold text-blue-400">0 days</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Total Points</h3>
              <p className="text-3xl font-bold text-green-400">0</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Level Progress</h3>
              <p className="text-3xl font-bold text-purple-400">0%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn; 