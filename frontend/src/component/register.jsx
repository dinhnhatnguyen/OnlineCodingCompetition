import React from 'react';
import "./component/style.css";

const Register = ({ switchToLogin }) => {
  return (
    <div className="form-page">
      <div className="form-container">
        <h2 className="pink-gradient">Register</h2>
        <p>Sign up to start solving coding challenges and join competitions.</p>
        <input type="text" placeholder="First Name" />
        <input type="text" placeholder="Last Name" />
        <input type="text" placeholder="Username" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <input type="password" placeholder="Confirm Password" />
        <button className="btn">Register</button>
      <div className="link" onClick={switchToLogin}>Already have an account? Log In</div>
      </div>
    </div>
  );
}
export default Register;
