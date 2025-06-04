import React, { useState, useEffect } from 'react';
import { Skull, Target, Zap } from 'lucide-react';

interface EliminationData {
  id: string;
  killerName: string;
  victimName: string;
  weapon: string;
  method: 'headshot' | 'bodyshot' | 'collision' | 'segments';
  timestamp: number;
}

interface EliminationBannerProps {
  eliminations: EliminationData[];
  onEliminationExpire: (id: string) => void;
}

const EliminationBanner: React.FC<EliminationBannerProps> = ({ 
  eliminations, 
  onEliminationExpire 
}) => {
  const [visibleEliminations, setVisibleEliminations] = useState<EliminationData[]>([]);

  useEffect(() => {
    // Add new eliminations to visible list
    eliminations.forEach(elimination => {
      if (!visibleEliminations.find(e => e.id === elimination.id)) {
        setVisibleEliminations(prev => [...prev, elimination]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
          setVisibleEliminations(prev => prev.filter(e => e.id !== elimination.id));
          onEliminationExpire(elimination.id);
        }, 4000);
      }
    });
  }, [eliminations, visibleEliminations, onEliminationExpire]);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'headshot':
        return <Target size={20} className="elimination-icon headshot" />;
      case 'bodyshot':
        return <Zap size={20} className="elimination-icon bodyshot" />;
      case 'collision':
        return <Skull size={20} className="elimination-icon collision" />;
      case 'segments':
        return <Skull size={20} className="elimination-icon segments" />;
      default:
        return <Skull size={20} className="elimination-icon default" />;
    }
  };

  const getMethodText = (method: string, weapon: string) => {
    switch (method) {
      case 'headshot':
        return `with a ${weapon} headshot`;
      case 'bodyshot':
        return `with ${weapon}`;
      case 'collision':
        return 'by collision';
      case 'segments':
        return `by destroying their segments with ${weapon}`;
      default:
        return `with ${weapon}`;
    }
  };

  const getWeaponDisplayName = (weapon: string) => {
    const weaponNames: Record<string, string> = {
      'sidearm': 'Snake Fang',
      'laser_pistol': 'Laser Pistol',
      'plasma_smg': 'Plasma SMG',
      'laser_rifle': 'Laser Rifle',
      'plasma_cannon': 'Plasma Cannon',
      'rocket_launcher': 'Rocket Launcher',
      'rail_gun': 'Rail Gun',
      'minigun': 'Minigun'
    };
    return weaponNames[weapon] || weapon;
  };

  if (visibleEliminations.length === 0) return null;

  return (
    <div className="elimination-banner-container">
      {visibleEliminations.map((elimination, index) => (
        <div 
          key={elimination.id} 
          className="elimination-banner"
          style={{ 
            animationDelay: `${index * 0.1}s`,
            top: `${20 + index * 60}px`
          }}
        >
          <div className="elimination-content">
            {getMethodIcon(elimination.method)}
            <div className="elimination-text">
              <span className="elimination-killer neon-text neon-red">
                You eliminated
              </span>
              <span className="elimination-victim neon-text neon-cyan">
                {elimination.victimName}
              </span>
              <span className="elimination-method neon-text neon-yellow">
                {getMethodText(elimination.method, getWeaponDisplayName(elimination.weapon))}
              </span>
            </div>
          </div>
          <div className="elimination-progress-bar">
            <div className="elimination-progress-fill"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EliminationBanner;
