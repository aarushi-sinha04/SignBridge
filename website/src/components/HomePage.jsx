import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to SignBridge</h1>
          <p className="text-xl text-white">Learn and practice sign language in a fun way!</p>
        </div>

       
          {/* <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Learn Signs</h2>
            <p className="text-gray-600 mb-6">
              Start learning sign language with our interactive lessons and practice sessions.
            </p>
            <Button onClick={() => navigate('/game')} className="w-full">
              Start Learning
            </Button>
          </Card> */}

          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Practice Game</h2>
            <p className="text-gray-600 mb-6">
              Test your skills with our interactive game. Show the correct signs and earn points!
            </p>
            <Button onClick={() => navigate('/game')} className="w-full">
              Play Game
            </Button>
          </Card>
       
      </div>
    </div>
  );
};

export default HomePage; 