import React from 'react';

function Contact() {
  return (
    <div className="glass-card">
      <h2 className="text-2xl font-bold mb-8 relative inline-block">
        Contact
        <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary"></span>
      </h2>
      <div className="space-y-6 text-text-secondary">
        <p>
          Have questions or suggestions? We'd love to hear from you!
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="text-text-primary font-semibold mb-2">Email</h3>
            <p>support@audiotosign.com</p>
          </div>
          <div>
            <h3 className="text-text-primary font-semibold mb-2">Address</h3>
            <p>NSUT<br />New Delhi</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact; 