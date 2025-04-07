import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-white' : 'text-white/80';
  };

  return (
    <header className="bg-black/50 backdrop-blur-sm fixed w-full z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-white font-bold text-xl neon-text">
              SignBridge
            </Link>
            {user && (
              <>
                <Link
                  to="/animation"
                  className={`${isActive('/animation')} hover:text-white transition-colors`}
                >
                  Audio to Sign
                </Link>
                <Link
                  to="/learn"
                  className={`${isActive('/learn')} hover:text-white transition-colors`}
                >
                  Learn
                </Link>
                <Link
                  to="/progress"
                  className={`${isActive('/progress')} hover:text-white transition-colors`}
                >
                  Progress
                </Link>
              </>
            )}
            <Link
              to="/about"
              className={`${isActive('/about')} hover:text-white transition-colors`}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`${isActive('/contact')} hover:text-white transition-colors`}
            >
              Contact
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white/80">
                  Welcome, {user.username}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition-all duration-300 border border-white/10 hover:border-neon-primary/80 relative group/btn"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-primary/30 via-neon-secondary/30 to-neon-accent/30 rounded-lg blur opacity-0 group-hover/btn:opacity-100 transition duration-300"></div>
                  <span className="relative">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition-all duration-300 border border-white/10 hover:border-neon-primary/80 relative group/btn"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-primary/30 via-neon-secondary/30 to-neon-accent/30 rounded-lg blur opacity-0 group-hover/btn:opacity-100 transition duration-300"></div>
                  <span className="relative">Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition-all duration-300 border border-white/10 hover:border-neon-primary/80 relative group/btn"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-primary/30 via-neon-secondary/30 to-neon-accent/30 rounded-lg blur opacity-0 group-hover/btn:opacity-100 transition duration-300"></div>
                  <span className="relative">Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 