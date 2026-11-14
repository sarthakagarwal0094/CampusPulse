
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Activity size={30} strokeWidth={2.5} />
          <span>Campus<span className="logo-accent">Pulse</span></span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`} id="landing-navigation">
          <a href="#home" className="nav-link active" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#features" className="nav-link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#events" className="nav-link" onClick={() => setMenuOpen(false)}>Events</a>
          <a href="#campuscred" className="nav-link" onClick={() => setMenuOpen(false)}>CampusCred</a>
          <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>About</a>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="nav-login">Login</Link>
          <Link to="/register" className="nav-register">Get Started</Link>
        </div>

        <button className="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="landing-navigation" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
