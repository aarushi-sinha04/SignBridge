"use client"

import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import helloVideo from '/assets/Hello.mp4';

const Home = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Autoplay prevented:', error);
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)]">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">
          SignBridge: Your Bridge to Sign Language
        </h2>
        <p className="text-white/80 text-lg">
          Experience seamless communication through our advanced audio-to-sign language converter.
        </p>
      </div>

      <div className="relative group mb-12">
        <div className="absolute -inset-1 bg-gradient-to-r from-neon-primary/30 via-neon-secondary/30 to-neon-accent/30 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full max-w-[500px] h-auto rounded-xl shadow-2xl transform transition-all duration-500 group-hover:scale-[1.01]"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={helloVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full px-4">
        <Link to="/animation" className="block group/btn">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-indigo-600/30 rounded-lg blur opacity-0 group-hover/btn:opacity-100 transition duration-300"></div>
            <button className="relative w-full px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg font-medium transition-all duration-300 group-hover/btn:bg-gray-800/80 border border-gray-700 group-hover/btn:border-indigo-500/80">
              Try Audio to Sign
            </button>
          </div>
        </Link>
        <Link to="/learn" className="block group/btn">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-indigo-600/30 rounded-lg blur opacity-0 group-hover/btn:opacity-100 transition duration-300"></div>
            <button className="relative w-full px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg font-medium transition-all duration-300 group-hover/btn:bg-gray-800/80 border border-gray-700 group-hover/btn:border-indigo-500/80">
              Learn Sign Language
            </button>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full px-4 mt-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-2">Audio to Sign</h3>
          <p className="text-gray-400">
            Convert your speech to sign language in real-time. Perfect for quick communication and learning.
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-2">Learn & Practice</h3>
          <p className="text-gray-400">
            Master sign language through interactive lessons and practice sessions with instant feedback.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

