import React from 'react';

const Login = ({ switchToRegister }) => {
  return (
    <div>
      <h2>Login to Your Account</h2>
      <p>Enter your credentials to access your coding challenges and competitions.</p>
      <input type="text" placeholder="Username" />
      <input type="password" placeholder="Password" />
      <button className="btn">Login</button>
      <div className="link" onClick={switchToRegister}>Don't have an account? Register</div>
    </div>
  );
};

export default Login;