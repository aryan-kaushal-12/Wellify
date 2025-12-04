import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Footer from './components/Footer';

export default function App(){
  const nav = useNavigate();
  const [authed, setAuthed] = useState(!!localStorage.getItem('accessToken'));
  const [theme, setTheme] = useState(() => {
    try {
      const t = localStorage.getItem('theme');
      if (t) return t;
      return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const update = () => setAuthed(!!localStorage.getItem('accessToken'));
    window.addEventListener('storage', update);
    window.addEventListener('authChange', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('authChange', update);
    };
  }, []);

  useEffect(() => {
    try{
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const logout = () => {
    localStorage.removeItem('accessToken');
    window.dispatchEvent(new Event('authChange'));
    nav('/login');
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div className="logo-badge">W</div>
            <div className="text-lg font-semibold">Wellness Board</div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="nav-link">Profile</Link>
            <Link to="/tips" className="nav-link">Tips</Link>
            <Link to="/saved" className="nav-link">Saved</Link>
            {!authed && <Link to="/login" className="nav-link">Login</Link>}
            {!authed && <Link to="/register" className="nav-link text-brand">Register</Link>}
            {authed && <button onClick={logout} className="nav-link">Logout</button>}
            <button
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              title="Toggle theme"
              className="theme-toggle"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </nav>

      <div className="hero-banner">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold">Small steps, better wellness</h1>
          <p className="mt-3 max-w-2xl mx-auto subtle text-lg">Discover simple, science-backed tips to improve daily habits — tailored for you.</p>
          <div className="mt-6">
            <Link to="/tips" className="btn-primary">Explore Tips</Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto p-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
