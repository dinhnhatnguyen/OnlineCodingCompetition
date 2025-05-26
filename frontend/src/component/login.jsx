import React from 'react';
import "./style.css";

const Login = ({ switchToRegister }) => {
  return (
    <div className="form-page">
      <div className="form-container">
        <h2 className="pink-gradient">Log In</h2>
        <p>Enter your credentials to access your coding challenges and competitions.</p>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button className="btn">Log In</button>
        <div className="link" onClick={switchToRegister}>Don't have an account? Register</div>
      </div>
    </div>
  );
}
export default Login;