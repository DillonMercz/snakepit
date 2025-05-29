import React, { useState } from 'react';
import '../snakepit-theme.css';

interface GlossaryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'gameplay' | 'financial' | 'technical' | 'social';
  icon: string;
}

const glossaryTerms: GlossaryTerm[] = [
  // Gameplay Terms
  { term: 'Boost', definition: 'Temporary speed increase activated by right-clicking. Consumes boost meter which regenerates by collecting food.', category: 'gameplay', icon: '⚡' },
  { term: 'Cash Orb', definition: 'Golden collectible items that increase your cash balance and snake size when collected.', category: 'gameplay', icon: '💰' },
  { term: 'Cashout', definition: 'Securing your current winnings by pressing C key. Only available when balance exceeds initial wager.', category: 'gameplay', icon: '💸' },
  { term: 'Snake Length', definition: 'Visual representation of your current cash balance. Longer snakes have more money.', category: 'gameplay', icon: '🐍' },
  { term: 'Invincibility', definition: 'Temporary protection period for new players, indicated by blinking snake animation.', category: 'gameplay', icon: '🛡️' },
  { term: 'Minimap', definition: 'Small map showing other players and entities in your lobby. Toggle with M key.', category: 'gameplay', icon: '🗺️' },
  
  // Financial Terms
  { term: 'Wager', definition: 'Initial amount you pay to enter a game. Deducted from balance when game starts.', category: 'financial', icon: '🎰' },
  { term: 'Balance', definition: 'Your current XRP holdings available for wagering and withdrawal.', category: 'financial', icon: '💎' },
  { term: 'Profit', definition: 'Amount earned above your initial wager. Only profit can be cashed out during gameplay.', category: 'financial', icon: '📈' },
  { term: 'House Edge', definition: '5% fee taken from winnings to maintain servers and development.', category: 'financial', icon: '🏠' },
  { term: 'Withdrawal', definition: 'Process of moving XRP from your game balance to your external wallet.', category: 'financial', icon: '🏧' },
  { term: 'Deposit', definition: 'Adding XRP from your external wallet to your game balance for wagering.', category: 'financial', icon: '💳' },
  
  // Technical Terms
  { term: 'RLS', definition: 'Row Level Security - Database security ensuring users can only access their own data.', category: 'technical', icon: '🔒' },
  { term: 'Anti-Cheat', definition: 'Server-side validation system preventing manipulation of game mechanics and balances.', category: 'technical', icon: '🛡️' },
  { term: 'Lag Compensation', definition: 'System that adjusts for network delays to ensure fair gameplay for all players.', category: 'technical', icon: '📡' },
  { term: 'Tick Rate', definition: 'Server update frequency (60Hz) determining how often game state is calculated.', category: 'technical', icon: '⏱️' },
  { term: 'Hitbox', definition: 'Invisible collision boundary around your snake used for detecting interactions.', category: 'technical', icon: '📦' },
  
  // Social Terms
  { term: 'Lobby', definition: 'Game room containing multiple players. Can be public or private.', category: 'social', icon: '🏠' },
  { term: 'Spectate', definition: 'Watching other players after death or cashing out. No interaction allowed.', category: 'social', icon: '👁️' },
  { term: 'Friend Request', definition: 'Invitation to connect with another player for easier matchmaking.', category: 'social', icon: '👥' },
  { term: 'Leaderboard', definition: 'Ranking system showing top players by various metrics (score, earnings, wins).', category: 'social', icon: '🏆' },
  { term: 'Achievement', definition: 'Milestone rewards for reaching specific gameplay or social goals.', category: 'social', icon: '🎖️' },
  { term: 'King', definition: 'Player with highest balance in lobby, marked with crown and screen indicator.', category: 'social', icon: '👑' }
];

export const Glossary: React.FC<GlossaryProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'gameplay' | 'financial' | 'technical' | 'social'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesCategory = activeCategory === 'all' || term.category === activeCategory;
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content glossary-modal">
        <div className="modal-header">
          <h2 className="modal-title neon-text neon-yellow">📚 Glossary</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Search and Filter */}
          <div className="glossary-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input neon-input"
              />
            </div>
            
            <div className="category-filters">
              <button
                className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${activeCategory === 'gameplay' ? 'active' : ''}`}
                onClick={() => setActiveCategory('gameplay')}
              >
                🎮 Gameplay
              </button>
              <button
                className={`filter-btn ${activeCategory === 'financial' ? 'active' : ''}`}
                onClick={() => setActiveCategory('financial')}
              >
                💰 Financial
              </button>
              <button
                className={`filter-btn ${activeCategory === 'technical' ? 'active' : ''}`}
                onClick={() => setActiveCategory('technical')}
              >
                🔧 Technical
              </button>
              <button
                className={`filter-btn ${activeCategory === 'social' ? 'active' : ''}`}
                onClick={() => setActiveCategory('social')}
              >
                👥 Social
              </button>
            </div>
          </div>

          {/* Terms List */}
          <div className="glossary-terms">
            {filteredTerms.length === 0 ? (
              <div className="no-results">
                <p className="neon-text neon-dim">No terms found matching your search.</p>
              </div>
            ) : (
              filteredTerms.map((term, index) => (
                <div key={index} className="glossary-term">
                  <div className="term-header">
                    <span className="term-icon">{term.icon}</span>
                    <h4 className="term-name neon-text neon-cyan">{term.term}</h4>
                    <span className={`term-category ${term.category}`}>
                      {term.category}
                    </span>
                  </div>
                  <p className="term-definition">{term.definition}</p>
                </div>
              ))
            )}
          </div>

          {/* Quick Stats */}
          <div className="glossary-stats">
            <div className="stat-item">
              <span className="stat-number">{glossaryTerms.length}</span>
              <span className="stat-label">Total Terms</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{filteredTerms.length}</span>
              <span className="stat-label">Showing</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{glossaryTerms.filter(t => t.category === 'gameplay').length}</span>
              <span className="stat-label">Gameplay</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{glossaryTerms.filter(t => t.category === 'financial').length}</span>
              <span className="stat-label">Financial</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="neon-button neon-yellow" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
