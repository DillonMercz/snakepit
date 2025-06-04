import React from 'react';
import { Crown } from 'lucide-react';

interface CrownIconProps {
  size?: number;
  className?: string;
  color?: string;
  animated?: boolean;
}

const CrownIcon: React.FC<CrownIconProps> = ({ 
  size = 20, 
  className = '', 
  color = '#FFD700',
  animated = false 
}) => {
  return (
    <Crown 
      size={size} 
      color={color}
      className={`crown-icon ${animated ? 'crown-animated' : ''} ${className}`}
      style={{
        filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))',
        animation: animated ? 'crown-pulse 2s ease-in-out infinite' : undefined
      }}
    />
  );
};

export default CrownIcon;
