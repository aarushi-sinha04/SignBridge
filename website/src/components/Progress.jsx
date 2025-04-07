import React from 'react';
import { useProgress } from '../context/ProgressContext';

const Progress = () => {
  const { progress, loading } = useProgress();

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card">
            <h2 className="text-2xl font-bold mb-6">Current Level</h2>
            <div className="text-4xl font-bold text-neon-primary mb-2">
              Level {progress?.level || 1}
            </div>
            <div className="text-white/80">
              {progress?.completedLessons?.length || 0} lessons completed
            </div>
          </div>

          <div className="glass-card">
            <h2 className="text-2xl font-bold mb-6">Achievements</h2>
            <div className="space-y-4">
              {progress?.achievements?.length > 0 ? (
                progress.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-neon-primary"></div>
                    <span className="text-white/80">{achievement}</span>
                  </div>
                ))
              ) : (
                <p className="text-white/60">No achievements yet. Keep learning!</p>
              )}
            </div>
          </div>

          <div className="glass-card md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Completed Lessons</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {progress?.completedLessons?.length > 0 ? (
                progress.completedLessons.map((lesson, index) => (
                  <div key={index} className="bg-black/40 p-4 rounded-lg border border-white/10">
                    <div className="text-neon-primary font-medium">{lesson}</div>
                  </div>
                ))
              ) : (
                <p className="text-white/60 col-span-full">No lessons completed yet. Start learning!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress; 