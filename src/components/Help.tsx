import React, { useState } from 'react';
import '../snakepit-theme.css';

interface HelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Help: React.FC<HelpProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'gameplay' | 'controls' | 'modes' | 'faq' | 'support'>('gameplay');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content help-modal">
        <div className="modal-header">
          <h2 className="modal-title neon-text neon-green">❓ Help & Support</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="help-navigation">
            <button
              className={`help-nav-btn ${activeSection === 'gameplay' ? 'active' : ''}`}
              onClick={() => setActiveSection('gameplay')}
            >
              🎮 Gameplay
            </button>
            <button
              className={`help-nav-btn ${activeSection === 'controls' ? 'active' : ''}`}
              onClick={() => setActiveSection('controls')}
            >
              🎯 Controls
            </button>
            <button
              className={`help-nav-btn ${activeSection === 'modes' ? 'active' : ''}`}
              onClick={() => setActiveSection('modes')}
            >
              🏆 Game Modes
            </button>
            <button
              className={`help-nav-btn ${activeSection === 'faq' ? 'active' : ''}`}
              onClick={() => setActiveSection('faq')}
            >
              ❓ FAQ
            </button>
            <button
              className={`help-nav-btn ${activeSection === 'support' ? 'active' : ''}`}
              onClick={() => setActiveSection('support')}
            >
              📞 Support
            </button>
          </div>

          <div className="help-content">
            {activeSection === 'gameplay' && (
              <div className="help-section">
                <h3 className="neon-text neon-cyan">🎮 How to Play</h3>
                <div className="help-item">
                  <h4>🐍 Basic Movement</h4>
                  <p>Use WASD keys or arrow keys to control your snake. Your snake moves continuously in the direction you're facing.</p>
                </div>
                <div className="help-item">
                  <h4>💰 Collecting Cash</h4>
                  <p>Collect golden orbs scattered around the map to increase your cash balance. Your snake size grows with your wealth!</p>
                </div>
                <div className="help-item">
                  <h4>⚡ Boost System</h4>
                  <p>Right-click to boost your speed. Boost depletes over time but can be recharged by collecting food.</p>
                </div>
                <div className="help-item">
                  <h4>💸 Cashing Out</h4>
                  <p>Press 'C' to cash out and secure your winnings. You can only cash out if you've gained money above your initial wager.</p>
                </div>
                <div className="help-item">
                  <h4>💀 Death & Respawn</h4>
                  <p>Avoid hitting other snakes or the map boundaries. When you die, you can spectate or start a new game.</p>
                </div>
              </div>
            )}

            {activeSection === 'controls' && (
              <div className="help-section">
                <h3 className="neon-text neon-cyan">🎯 Controls</h3>
                <div className="controls-grid">
                  <div className="control-item">
                    <span className="control-key">W A S D</span>
                    <span className="control-desc">Move snake</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">Arrow Keys</span>
                    <span className="control-desc">Alternative movement</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">Right Click</span>
                    <span className="control-desc">Boost speed</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">C</span>
                    <span className="control-desc">Cash out</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">M</span>
                    <span className="control-desc">Toggle minimap</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">ESC</span>
                    <span className="control-desc">Pause / Menu</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">1-5</span>
                    <span className="control-desc">Switch weapons (Warfare mode)</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">Left Click</span>
                    <span className="control-desc">Fire weapon (Warfare mode)</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'modes' && (
              <div className="help-section">
                <h3 className="neon-text neon-cyan">🏆 Game Modes</h3>
                <div className="help-item">
                  <h4>🐍 Classic Mode</h4>
                  <p>Traditional snake gameplay with a financial twist. Collect cash, avoid other players, and cash out to win real money.</p>
                  <ul>
                    <li>No weapons or combat</li>
                    <li>Focus on collection and survival</li>
                    <li>Peaceful but competitive</li>
                    <li>Lower risk, steady rewards</li>
                  </ul>
                </div>
                <div className="help-item">
                  <h4>⚔️ Warfare Mode</h4>
                  <p>Combat-focused gameplay where you can attack other players with various weapons while collecting cash.</p>
                  <ul>
                    <li>Multiple weapon types</li>
                    <li>Attack and defend against other players</li>
                    <li>Higher risk, higher rewards</li>
                    <li>Power-ups and defensive items</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'faq' && (
              <div className="help-section">
                <h3 className="neon-text neon-cyan">❓ Frequently Asked Questions</h3>
                <div className="help-item">
                  <h4>How do I withdraw my winnings?</h4>
                  <p>Use the cashout button in your profile or press 'C' during gameplay to secure your current balance. Withdrawals are processed to your connected wallet.</p>
                </div>
                <div className="help-item">
                  <h4>What happens if I lose connection?</h4>
                  <p>Your game state is saved on our servers. If you disconnect, you can rejoin the same game session within 60 seconds.</p>
                </div>
                <div className="help-item">
                  <h4>Are there any fees?</h4>
                  <p>We charge a small 5% fee on winnings to maintain the servers and development. No fees on deposits or losses.</p>
                </div>
                <div className="help-item">
                  <h4>How is fairness ensured?</h4>
                  <p>All game mechanics are server-side validated with anti-cheat protection. Random events use cryptographically secure randomness.</p>
                </div>
                <div className="help-item">
                  <h4>Can I play with friends?</h4>
                  <p>Yes! Add friends through the Friends tab and invite them to private lobbies or join the same public games.</p>
                </div>
                <div className="help-item">
                  <h4>What's the minimum/maximum wager?</h4>
                  <p>Minimum wager is $1, maximum is $500 per game. Higher stakes private lobbies may be available for VIP players.</p>
                </div>
              </div>
            )}

            {activeSection === 'support' && (
              <div className="help-section">
                <h3 className="neon-text neon-cyan">📞 Contact Support</h3>
                <div className="help-item">
                  <h4>🎮 Game Issues</h4>
                  <p>For gameplay problems, bugs, or technical issues:</p>
                  <ul>
                    <li>Email: support@snakepit.game</li>
                    <li>Discord: #support channel</li>
                    <li>Response time: 2-4 hours</li>
                  </ul>
                </div>
                <div className="help-item">
                  <h4>💰 Financial Support</h4>
                  <p>For deposit, withdrawal, or balance issues:</p>
                  <ul>
                    <li>Email: finance@snakepit.game</li>
                    <li>Priority support line</li>
                    <li>Response time: 30 minutes</li>
                  </ul>
                </div>
                <div className="help-item">
                  <h4>🔒 Security Concerns</h4>
                  <p>For account security or suspicious activity:</p>
                  <ul>
                    <li>Email: security@snakepit.game</li>
                    <li>24/7 monitoring</li>
                    <li>Immediate response</li>
                  </ul>
                </div>
                <div className="help-item">
                  <h4>💬 Community</h4>
                  <p>Join our community for tips, strategies, and updates:</p>
                  <ul>
                    <li>Discord: discord.gg/snakepit</li>
                    <li>Reddit: r/SnakePitGame</li>
                    <li>Twitter: @SnakePitGame</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="neon-button neon-green" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
