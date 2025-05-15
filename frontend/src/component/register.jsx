import React from 'react';

const Register = ({ switchToLogin }) => {
  return (
    <div>
      <h2>Create an Account</h2>
      <p>Sign up to start solving coding challenges and join competitions.</p>
      <input type="text" placeholder="First Name" />
      <input type="text" placeholder="Last Name" />
      <input type="text" placeholder="Username" />
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <input type="password" placeholder="Confirm Password" />
      <button className="btn">Register</button>
      <div className="link" onClick={switchToLogin}>Already have an account? Login</div>
    </div>
  );
};

export default Register;
