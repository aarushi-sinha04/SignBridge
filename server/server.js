const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use environment variable

// In-memory user storage (replace with a database in production)
const users = [];
const userProgress = {};

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    if (users.find(u => u.username === username || u.email === email)) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword
    };

    users.push(user);

    // Initialize user progress
    userProgress[user.id] = {
      streak: 0,
      totalPoints: 0,
      levelProgress: {
        1: 0, // Alphabets
        2: 0, // Words
        3: 0  // Sentences
      },
      dailyGoals: {
        completed: 0,
        total: 5
      }
    };

    // Create token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get user progress
app.get('/api/progress', verifyToken, (req, res) => {
  try {
    const progress = userProgress[req.userId];
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    res.json(progress);
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({ message: 'Error fetching progress' });
  }
});

// Update user progress
app.post('/api/progress', verifyToken, (req, res) => {
  try {
    const { levelId, points } = req.body;
    const progress = userProgress[req.userId];
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // Update level progress
    if (levelId) {
      progress.levelProgress[levelId] = Math.min(100, progress.levelProgress[levelId] + points);
    }

    // Update total points
    progress.totalPoints += points;

    // Update daily goals
    progress.dailyGoals.completed = Math.min(progress.dailyGoals.total, progress.dailyGoals.completed + 1);

    res.json(progress);
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ message: 'Error updating progress' });
  }
});

// Get practice content
app.get('/api/practice/:levelId', verifyToken, (req, res) => {
  try {
    const { levelId } = req.params;
    const content = {
      1: {
        title: 'Alphabets',
        items: [
          { sign: 'A', video: 'A.mp4', description: 'Make a fist with your thumb sticking out' },
          { sign: 'B', video: 'B.mp4', description: 'Hold your hand flat with fingers together' },
          { sign: 'C', video: 'C.mp4', description: 'Form a C shape with your hand' },
          { sign: 'D', video: 'D.mp4', description: 'Point your index finger up' },
          { sign: 'E', video: 'E.mp4', description: 'Make a fist with your thumb across fingers' }
        ]
      },
      2: {
        title: 'Words',
        items: [
          { sign: 'Hello', video: 'Hello.mp4', description: 'Wave your hand' },
          { sign: 'Thank You', video: 'ThankYou.mp4', description: 'Touch your chin and move forward' },
          { sign: 'Please', video: 'Please.mp4', description: 'Rub your chest in a circular motion' },
          { sign: 'Sorry', video: 'Sorry.mp4', description: 'Make a fist and rub your chest' },
          { sign: 'Goodbye', video: 'Goodbye.mp4', description: 'Wave your hand' }
        ]
      },
      3: {
        title: 'Sentences',
        items: [
          { sign: 'How are you?', video: 'HowAreYou.mp4', description: 'Combination of signs' },
          { sign: 'My name is...', video: 'MyNameIs.mp4', description: 'Combination of signs' },
          { sign: 'Nice to meet you', video: 'NiceToMeetYou.mp4', description: 'Combination of signs' },
          { sign: 'I love you', video: 'ILoveYou.mp4', description: 'Combination of signs' },
          { sign: 'What is your name?', video: 'WhatIsYourName.mp4', description: 'Combination of signs' }
        ]
      }
    };

    res.json(content[levelId] || content[1]);
  } catch (error) {
    console.error('Practice content error:', error);
    res.status(500).json({ message: 'Error fetching practice content' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 