import React, { useState } from 'react';
import Login from './login';
import Register from '/register';
import './styles.css';

const App = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="container">
      <div className="form-container">
        <div className="tabs">
          <button
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>
        {isLogin ? (
          <Login switchToRegister={() => setIsLogin(false)} />
        ) : (
          <Register switchToLogin={() => setIsLogin(true)} />
        )}
      </div>

      <div className="info-container">
        <h1>
          Online Coding <span className="purple">Competition</span> System
        </h1>
        <p>
          Sharpen your coding skills, compete with peers, and track your progress with our university-focused coding platform.
        </p>
        <div className="features">
          <div className="feature">
            <span className="feature-dot"></span>
            <strong>Practice & Improve</strong><br />
            Solve problems of varying difficulty in multiple programming languages.
          </div>
          <div className="feature">
            <span className="feature-dot"></span>
            <strong>Compete & Challenge</strong><br />
            Participate in timed competitions and climb the university leaderboard.
          </div>
          <div className="feature">
            <span className="feature-dot"></span>
            <strong>Learn & Grow</strong><br />
            Track your progress, analyze submission history, and enhance your skills.
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
