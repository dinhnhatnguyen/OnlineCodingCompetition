import React from "react";
import { FaBolt, FaBullseye, FaCheckCircle, FaCode, FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import "../style.css";

function Homepage() {
  return (
    <div className="homepage">
      <header className="header">
        <div className="logo pink-gradient">AlgoPractice</div>
        <nav className="nav">
          <a href="#" className="nav-link">
            Problems
          </a>
          <a href="#" className="nav-link">
            Contests
          </a>
        </nav>
        <div className="auth-buttons">
          <button className="btn-outline">Log in</button>
          <button className="btn pink-gradient">Register</button>
        </div>
      </header>

      <main className="main-content">
        <h1 className="main-title">Master Algorithms, Ace Your Coding Interviews</h1>
        <p className="main-subtitle">
          Enhance your problem-solving skills with our collection of algorithm
          challenges. Practice, compete, and learn with AlgoPractice.
        </p>
        <div className="main-buttons">
          <button className="btn pink-gradient">Start Practicing</button>
          <button className="btn-outline">View Contests</button>
        </div>

        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-dot pink-gradient"></div>
            <div>
              <h3>Curated Problems</h3>
              <p>
                Practice with a diverse collection of algorithm problems, ranging
                from easy to hard difficulty.
              </p>
            </div>
          </div>
          <div className="feature-box">
            <div className="feature-dot pink-gradient"><FaCode /></div>
            <div>
              <h3>Weekly Contests</h3>
              <p>
                Test your skills in weekly coding contests and compete with other
                developers globally.
              </p>
            </div>
          </div>
          <div className="feature-box">
            <div className="feature-dot pink-gradient"><FaBolt /></div>
            <div>
              <h3>Real-time Feedback</h3>
              <p>
                Get immediate feedback on your solutions with detailed test cases
                and performance metrics.
              </p>
            </div>
          </div>
        </div>

        <section className="interview-prep">
          <h2>Prepare for Technical Interviews</h2>
          <p>
            Out platform is designed to help you excel in technical interviews at top tech
            companies. With problems similar to those asked in real interviews, you'll be
            well-prepared to showcase your algorithmic skills.
          </p>
          <ul>
            <li><FaCheckCircle className="pink-gradient icon-inline" />Over 500 algorithm problems across multiple categories</li>
            <li><FaCheckCircle className="pink-gradient icon-inline" />Support for multiple programming languages</li>
            <li><FaCheckCircle className="pink-gradient icon-inline" />Detailed explanations and optimal solutions</li>
          </ul>
          <button className="btn pink-gradient">Browse Problems</button>
        </section>

        <section className="cta-box">
          <h2>Ready to elevate your coding skills?</h2>
          <p>
            Join thousands of developers improving their problem-solving abilities
            and preparing for technical interviews.
          </p>
          <button className="btn pink-gradient">Start Coding Now</button>
        </section>

        <section className="code-box">
          <pre>
            {`// Example Problem: Two Sum
            function twoSum(nums, target) {
            const map = new Map();

            for (let i = 0; i < nums.length; i++) {
                const complement = target - nums[i];
                if (map.has(complement)) {
                return [map.get(complement), i];
                }
                map.set(nums[i], i);
            }
            return null;
            }`}
          </pre>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-left">
          <div className="pink-gradient">AlgoPractice</div>
          <p>Master algorithms, one problem at a time.</p>
          <p>&copy; 2025 AlgoPractice. All rights reserved.</p>
        </div>
        <div className="footer-right">
          <a href="#"><FaGithub /></a>
          <a href="#"><FaTwitter /></a>
          <a href="#"><FaDiscord /></a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;