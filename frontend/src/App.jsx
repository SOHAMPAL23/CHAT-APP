import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WhatsAppHomePage from './pages/WhatsAppHomePage';
import './App.css';

function App() {
  const { user, getMe, isLoading } = useAuthStore();
  const initialized = useRef(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Only call getMe once on mount
    if (!initialized.current) {
      initialized.current = true;
      getMe().finally(() => {
        setAuthChecked(true);
      });
    }
  }, [getMe]);

  // Show loading only during initial auth check
  if (!authChecked) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <SignupPage />}
        />
        <Route
          path="/"
          element={user ? <WhatsAppHomePage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
