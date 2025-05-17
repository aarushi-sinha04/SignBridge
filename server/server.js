const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Proxy middleware for Python ASL server
app.use('/api/asl', createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: {
        '^/api/asl': '/'
    }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/signbridge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  progress: {
    level: { type: Number, default: 1 },
    score: { type: Number, default: 0 },
    completedLessons: [{ type: String }],
    currentLesson: { type: String, default: '' },
    achievements: [{ type: String }],
    lastActive: { type: Date, default: Date.now }
  }
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        progress: user.progress
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, username: user.username, progress: user.progress } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Protected route middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Update progress endpoint
app.post('/api/user/progress', authenticateToken, async (req, res) => {
  try {
    const { score } = req.body;
    console.log('Progress update request - Adding score:', score);

    // First get the current user to check their progress
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Current user progress:', currentUser.progress);

    // Calculate new score by adding to existing score
    const newScore = (currentUser.progress.score || 0) + (score || 0);
    console.log('New score will be:', newScore);

    // Update user with new score
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.userId },
      {
        $set: {
          'progress.score': newScore,
          'progress.lastActive': Date.now()
        }
      },
      { new: true } // Return the updated document
    );

    console.log('Updated user progress:', updatedUser.progress);

    res.json({
      message: 'Progress updated successfully',
      progress: updatedUser.progress
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Error updating progress' });
  }
});

// Separate endpoint to unlock level 2
app.post('/api/user/unlock-level2', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.progress.score >= 30) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user.userId },
        {
          $set: {
            'progress.level': 2,
            'progress.lastActive': Date.now()
          }
        },
        { new: true }
      );

      res.json({
        message: 'Level 2 unlocked successfully',
        progress: updatedUser.progress
      });
    } else {
      res.status(400).json({
        message: 'Not enough points to unlock level 2',
        required: 30,
        current: currentUser.progress.score
      });
    }
  } catch (error) {
    console.error('Error unlocking level 2:', error);
    res.status(500).json({ message: 'Error unlocking level 2' });
  }
});

// Separate endpoint to unlock level 3
app.post('/api/user/unlock-level3', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.progress.score >= 60) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user.userId },
        {
          $set: {
            'progress.level': 3,
            'progress.lastActive': Date.now()
          }
        },
        { new: true }
      );

      res.json({
        message: 'Level 3 unlocked successfully',
        progress: updatedUser.progress
      });
    } else {
      res.status(400).json({
        message: 'Not enough points to unlock level 3',
        required: 60,
        current: currentUser.progress.score
      });
    }
  } catch (error) {
    console.error('Error unlocking level 3:', error);
    res.status(500).json({ message: 'Error unlocking level 3' });
  }
});

// Get detailed progress endpoint
app.get('/api/user/progress', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      progress: user.progress,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Error fetching progress' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});