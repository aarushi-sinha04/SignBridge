import React from 'react';

function About() {
  return (
    <div className="glass-card">
      <h2 className="text-2xl font-bold mb-8 relative inline-block">
        About
        <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary"></span>
      </h2>
      <div className="space-y-6 text-text-secondary">
        <p>
          Our Audio to Sign Language Converter is an innovative tool designed to bridge the communication gap between the hearing and deaf communities.
        </p>
        <p>
          Using advanced speech recognition and video synthesis technology, we convert spoken words into corresponding sign language animations in real-time.
        </p>
        <p>
          This project aims to make communication more accessible and inclusive for everyone.
        </p>
      </div>
    </div>
  );
}

export default About; 