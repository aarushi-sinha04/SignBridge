import React, { useEffect, useState } from 'react';
import { useProgress } from '../context/ProgressContext';

const API_BASE_URL = 'http://localhost:8000';

const Progress = () => {
  const { progress, loading, fetchProgress } = useProgress();
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleResetProgress = async () => {
    try {
      setResetting(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/user/reset-progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        await fetchProgress(); // reload progress from context
      }
    } catch (e) {
      console.error('Error resetting progress:', e);
    } finally {
      setResetting(false);
    }
  };

  if (loading || resetting) {
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

  // Calculate values from progress data
  const level = progress?.level || 1;
  const score = progress?.score || 0;
  const streak = progress?.streak || 0;
  const completedLessons = Array.isArray(progress?.completedLessons) ? [...progress.completedLessons].sort() : [];

  const allLetters = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  const lettersLeft = allLetters.filter(l => !completedLessons.includes(l));

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Your SignBridge Progress</h1>
          <p className="text-xl text-white/80">Track your sign language learning journey</p>
        </div>

        <div className="mt-12 bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-6">Your Progress Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Current Streak</h3>
              <p className="text-3xl font-bold text-blue-400">{streak} days</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Total Points</h3>
              <p className="text-3xl font-bold text-green-400">{score}</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Level Progress</h3>
              <p className="text-3xl font-bold text-purple-400">Level {level}</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-300 mb-4 border-b border-gray-600 pb-2">Lessons Completed</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {completedLessons.length > 0 ? completedLessons.map(lesson => (
                <span key={lesson} className="bg-green-500/20 text-green-400 font-bold px-3 py-1 rounded-lg border border-green-500/30">
                  {lesson}
                </span>
              )) : <span className="text-gray-500 italic">None yet. Play some games!</span>}
            </div>

            <h3 className="text-lg font-medium text-gray-300 mb-4 border-b border-gray-600 pb-2">Letters Left</h3>
            <div className="flex flex-wrap gap-2">
              {lettersLeft.map(letter => (
                <span key={letter} className="bg-gray-700/50 text-gray-400 font-bold px-3 py-1 rounded-lg border border-gray-600">
                  {letter}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button
              onClick={handleResetProgress}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-2 rounded-xl transition-all duration-300"
            >
              Reset Progress ↺
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;