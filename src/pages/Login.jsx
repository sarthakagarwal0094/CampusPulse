
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
} from 'lucide-react';
import './Login.css';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { user, login, homeForRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    const account = login(email);
    if (!account) {
      alert('This account is not available or is inactive. Contact an administrator.');
      return;
    }
    const destination = location.state?.from?.pathname;
    navigate(destination?.startsWith(homeForRole('admin')) || destination?.startsWith(homeForRole('coordinator')) || destination?.startsWith(homeForRole('student'))
      ? destination : homeForRole(account.role), { replace: true });
  };

  if (user) return <Navigate to={homeForRole(user.role)} replace />;

  return (
    <div className="login-page">

      {/* LEFT PANEL */}
      <div className="login-visual">
        <Link to="/" className="login-logo">
          <Activity size={32} />
          <span>Campus<span>Pulse</span></span>
        </Link>

        <div className="login-visual-content">
          <span className="login-badge">CAMPUS LIFE, CONNECTED</span>

          <h1>
            Your campus journey
            <br />
            starts <span>here.</span>
          </h1>

          <p>
            Discover events, connect with your campus community,
            and turn every experience into an achievement.
          </p>

          <div className="login-visual-footer">
            <span>Discover</span>
            <span>Participate</span>
            <span>Achieve</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-form-panel">
        <Link to="/" className="back-home">
          ← Back to home
        </Link>

        <div className="login-form-container">
          <div className="login-heading">
            <span className="login-small-label">WELCOME BACK</span>
            <h2>Login to CampusPulse</h2>
            <p>Continue your campus journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">

            <label htmlFor="email">Email address</label>
            <div className="login-input-wrapper">
              <Mail size={19} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@college.edu"
                required
              />
            </div>

            <div className="password-label-row">
              <label htmlFor="password">Password</label>
              <span title="Password recovery is unavailable">Password recovery unavailable</span>
            </div>

            <div className="login-input-wrapper">
              <Lock size={19} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <button type="submit" className="login-submit">
              Login to your account
              <ArrowRight size={19} />
            </button>

          </form>

          <div className="login-register">
            Don't have an account?
            <Link to="/register"> Create account</Link>
          </div>

          <div className="login-bottom">
            Built for campus life. Made for students.
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;
