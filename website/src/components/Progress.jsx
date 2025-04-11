import React from 'react';
import { useProgress } from '../context/ProgressContext';

const Progress = () => {
  const { loading } = useProgress(); // Removed unused `progress`

  // Hardcoded values
  const level = 1;
  const score = 20;
  const nextLevelThreshold = 100;
  const pointsRemaining = nextLevelThreshold - score;
  const streak = 2;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-primary mx-auto"></div>
            <p className="text-white/80 mt-4">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Your SignBridge Progress</h1>
          <p className="text-xl text-white/80">Track your sign language learning journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="glass-card">
            <h2 className="text-2xl font-bold mb-4">Current Level</h2>
            <div className="text-4xl font-bold text-neon-primary mb-2">Level {level}</div>
            <p className="text-white/80">Need {pointsRemaining} more points to unlock Level 2</p>
          </div>

          <div className="glass-card">
            <h2 className="text-2xl font-bold mb-4">Score</h2>
            <div className="text-4xl font-bold text-neon-primary mb-2">{score} pts</div>
            <p className="text-white/80">Keep learning to level up!</p>
          </div>

          <div className="glass-card">
            <h2 className="text-2xl font-bold mb-4">Streak</h2>
            <div className="text-4xl font-bold text-neon-primary mb-2">{streak} days </div>
            <p className="text-white/80">Consistency is key!</p>
          </div>
        </div>

        <div className="glass-card">
          <h2 className="text-2xl font-bold mb-6">Completed Lessons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <p className="text-white/60 col-span-full">No lessons completed yet. Start learning!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
