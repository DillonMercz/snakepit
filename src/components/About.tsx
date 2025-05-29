import React from 'react';
import '../snakepit-theme.css';

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
}

export const About: React.FC<AboutProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content about-modal">
        <div className="modal-header">
          <h2 className="modal-title neon-text neon-orange">📖 About SnakePit</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Game Overview */}
          <div className="about-section">
            <h3 className="section-title neon-text neon-cyan">🎮 What is SnakePit?</h3>
            <p className="about-text">
              SnakePit is a revolutionary multiplayer snake game that combines classic arcade gameplay 
              with real money rewards. Built on blockchain technology, it offers transparent, 
              provably fair gaming where your skills directly translate to cryptocurrency earnings.
            </p>
          </div>

          {/* Key Features */}
          <div className="about-section">
            <h3 className="section-title neon-text neon-cyan">✨ Key Features</h3>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">💰</span>
                <div className="feature-content">
                  <h4>Real Money Rewards</h4>
                  <p>Win actual cryptocurrency (XRP) based on your gameplay performance</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🛡️</span>
                <div className="feature-content">
                  <h4>Provably Fair</h4>
                  <p>All game mechanics are transparent and verifiable on the blockchain</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚔️</span>
                <div className="feature-content">
                  <h4>Multiple Game Modes</h4>
                  <p>Classic collection mode and intense warfare mode with weapons</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <div className="feature-content">
                  <h4>Social Gaming</h4>
                  <p>Friends system, leaderboards, and competitive tournaments</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎨</span>
                <div className="feature-content">
                  <h4>Customization</h4>
                  <p>Unlock unique snake skins, weapons, and power-ups</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <div className="feature-content">
                  <h4>Secure & Safe</h4>
                  <p>Advanced anti-cheat protection and secure wallet integration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div className="about-section">
            <h3 className="section-title neon-text neon-cyan">🔧 Technology Stack</h3>
            <div className="tech-grid">
              <div className="tech-item">
                <h4>Frontend</h4>
                <ul>
                  <li>React + TypeScript</li>
                  <li>HTML5 Canvas</li>
                  <li>WebGL Graphics</li>
                  <li>Real-time WebSockets</li>
                </ul>
              </div>
              <div className="tech-item">
                <h4>Backend</h4>
                <ul>
                  <li>Supabase Database</li>
                  <li>Row Level Security</li>
                  <li>Real-time Subscriptions</li>
                  <li>Edge Functions</li>
                </ul>
              </div>
              <div className="tech-item">
                <h4>Blockchain</h4>
                <ul>
                  <li>XRP Ledger</li>
                  <li>Smart Contracts</li>
                  <li>Wallet Integration</li>
                  <li>Instant Settlements</li>
                </ul>
              </div>
              <div className="tech-item">
                <h4>Security</h4>
                <ul>
                  <li>Server-side Validation</li>
                  <li>Anti-cheat Systems</li>
                  <li>Encrypted Communications</li>
                  <li>Audit Trails</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="about-section">
            <h3 className="section-title neon-text neon-cyan">👨‍💻 Development Team</h3>
            <p className="about-text">
              SnakePit is developed by a passionate team of blockchain developers, game designers, 
              and security experts. Our mission is to create fair, transparent, and entertaining 
              games that reward skill and provide real value to players.
            </p>
          </div>

          {/* Legal & Compliance */}
          <div className="about-section">
            <h3 className="section-title neon-text neon-cyan">⚖️ Legal & Compliance</h3>
            <div className="legal-info">
              <div className="legal-item">
                <h4>🔞 Age Requirement</h4>
                <p>Players must be 18+ years old to participate in real money gaming</p>
              </div>
              <div className="legal-item">
                <h4>🌍 Jurisdiction</h4>
                <p>Available in jurisdictions where online gaming is legal</p>
              </div>
              <div className="legal-item">
                <h4>🛡️ Responsible Gaming</h4>
                <p>We promote responsible gaming with built-in limits and controls</p>
              </div>
              <div className="legal-item">
                <h4>📋 Licensing</h4>
                <p>Fully licensed and regulated gaming platform</p>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <div className="about-section">
            <h3 className="section-title neon-text neon-cyan">📊 Version Information</h3>
            <div className="version-info">
              <div className="version-item">
                <span className="version-label">Game Version:</span>
                <span className="version-value neon-text neon-green">v1.0.0-beta</span>
              </div>
              <div className="version-item">
                <span className="version-label">Last Updated:</span>
                <span className="version-value">December 2024</span>
              </div>
              <div className="version-item">
                <span className="version-label">Build:</span>
                <span className="version-value">#2024.12.001</span>
              </div>
              <div className="version-item">
                <span className="version-label">Network:</span>
                <span className="version-value neon-text neon-cyan">XRP Ledger Mainnet</span>
              </div>
            </div>
          </div>

          {/* Contact & Links */}
          <div className="about-section">
            <h3 className="section-title neon-text neon-cyan">🔗 Links & Contact</h3>
            <div className="links-grid">
              <a href="#" className="link-item neon-button neon-cyan">
                🌐 Website
              </a>
              <a href="#" className="link-item neon-button neon-purple">
                💬 Discord
              </a>
              <a href="#" className="link-item neon-button neon-blue">
                🐦 Twitter
              </a>
              <a href="#" className="link-item neon-button neon-orange">
                📧 Support
              </a>
              <a href="#" className="link-item neon-button neon-green">
                📖 Documentation
              </a>
              <a href="#" className="link-item neon-button neon-pink">
                🔍 Source Code
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="about-section disclaimer">
            <h3 className="section-title neon-text neon-orange">⚠️ Disclaimer</h3>
            <p className="disclaimer-text">
              SnakePit involves real money gaming and cryptocurrency transactions. 
              Please play responsibly and only wager what you can afford to lose. 
              Gaming can be addictive - seek help if needed. Past performance does not 
              guarantee future results. All transactions are final and irreversible.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="neon-button neon-orange" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
