import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const ProgressPage = () => {
  const navigate = useNavigate();

  // Hardcoded values as requested
  const currentLevel = 1;
  const currentScore = 20;
  const pointsNeeded = 80;
  const streakDays = 2;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Your Progress</h1>
          <p className="text-xl text-white/80">Track your learning journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Level Progress */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Level Progress</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg">Current Level</span>
                <span className="text-2xl font-bold">Level {currentLevel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg">Current Score</span>
                <span className="text-2xl font-bold">{currentScore} points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg">Points to Next Level</span>
                <span className="text-2xl font-bold">{pointsNeeded} points</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full" 
                  style={{ width: `${(currentScore / (currentScore + pointsNeeded)) * 100}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Streak */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Streak</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg">Current Streak</span>
                <span className="text-2xl font-bold">{streakDays} days</span>
              </div>
              <div className="text-sm text-gray-500">
                Keep practicing daily to maintain your streak!
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button 
            onClick={() => navigate('/game')}
            className="px-8 py-3 text-lg"
          >
            Continue Learning
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage; 