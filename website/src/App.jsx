import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Animation from './components/Animation';
import Login from './components/Login';
import Signup from './components/Signup';
import About from './components/About';
import Contact from './components/Contact';
import Learn from './components/Learn';
import Level from './components/Level';
import Progress from './components/Progress';
import Practice from './components/Practice';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProgressProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/HomePage" element={<HomePage />} />
              {/* <Route path="/learn" element={<Learn />} /> */}
              <Route 
                path="/learn" 
                element={
                  <PrivateRoute>
                    <Learn />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/learn/level:levelId" 
                element={
                  <PrivateRoute>
                    <Level />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/practice/:levelId" 
                element={
                  <PrivateRoute>
                    <Practice />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/progress" 
                element={
                  <PrivateRoute>
                    <Progress />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/animation" 
                element={
                  <PrivateRoute>
                    <Animation />
                  </PrivateRoute>
                } 
              />
              <Route path="/game" element={<GamePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ProgressProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
