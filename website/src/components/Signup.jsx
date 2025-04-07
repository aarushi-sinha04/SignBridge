import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await signup({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-8 relative inline-block">
          Sign Up
          <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary"></span>
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input-primary w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-primary w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-primary w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-primary w-full"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Sign Up
          </button>

          <p className="text-center text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-primary hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup; 