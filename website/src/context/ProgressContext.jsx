import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API_BASE_URL = 'http://localhost:8000';

const ProgressContext = createContext(null);

export const ProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/user/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/user/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
        return { success: true };
      } else {
        return { success: false, error: 'Failed to update progress' };
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      return { success: false, error: 'Error updating progress' };
    }
  };

  return (
    <ProgressContext.Provider value={{ progress, loading, updateProgress, fetchProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}; 