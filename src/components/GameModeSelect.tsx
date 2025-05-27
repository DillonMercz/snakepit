import React, { useEffect, useRef } from 'react';
import { GameMode } from '../App';

interface GameModeSelectProps {
  onModeSelect: (mode: GameMode) => void;
}

interface FallingItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  type: 'coin' | 'cash' | 'diamond';
  size: number;
  opacity: number;
}

const GameModeSelect: React.FC<GameModeSelectProps> = ({ onModeSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const itemsRef = useRef<FallingItem[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize falling items
    const initItems = () => {
      itemsRef.current = [];
      for (let i = 0; i < 50; i++) {
        itemsRef.current.push(createRandomItem());
      }
    };

    const createRandomItem = (): FallingItem => {
      const types: ('coin' | 'cash' | 'diamond')[] = ['coin', 'cash', 'diamond'];
      return {
        x: Math.random() * canvas.width,
        y: -50 - Math.random() * 500,
        vx: (Math.random() - 0.5) * 2,
        vy: 1 + Math.random() * 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        type: types[Math.floor(Math.random() * types.length)],
        size: 20 + Math.random() * 30,
        opacity: 0.3 + Math.random() * 0.7
      };
    };

    const drawCoin = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      // Coin gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(0.7, '#FFA500');
      gradient.addColorStop(1, '#FF8C00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();

      // Inner circle
      ctx.fillStyle = '#DAA520';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Dollar sign
      ctx.fillStyle = '#8B4513';
      ctx.font = `${size * 1.2}px bold monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 0);

      ctx.restore();
    };

    const drawCash = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      // Cash bill
      const gradient = ctx.createLinearGradient(-size, -size * 0.6, size, size * 0.6);
      gradient.addColorStop(0, '#228B22');
      gradient.addColorStop(0.5, '#32CD32');
      gradient.addColorStop(1, '#228B22');

      ctx.fillStyle = gradient;
      ctx.fillRect(-size, -size * 0.6, size * 2, size * 1.2);

      // Border
      ctx.strokeStyle = '#006400';
      ctx.lineWidth = 2;
      ctx.strokeRect(-size, -size * 0.6, size * 2, size * 1.2);

      // Dollar sign
      ctx.fillStyle = '#006400';
      ctx.font = `${size * 0.8}px bold monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💵', 0, 0);

      ctx.restore();
    };

    const drawDiamond = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      // Diamond gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, '#FF69B4');
      gradient.addColorStop(0.5, '#FF1493');
      gradient.addColorStop(1, '#DC143C');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.7, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.7, 0);
      ctx.closePath();
      ctx.fill();

      // Inner sparkle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-size * 0.3, -size * 0.3, size * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw items
      itemsRef.current.forEach((item, index) => {
        // Update position
        item.x += item.vx;
        item.y += item.vy;
        item.rotation += item.rotationSpeed;

        // Reset if off screen
        if (item.y > canvas.height + 100) {
          itemsRef.current[index] = createRandomItem();
          return;
        }

        // Draw based on type
        switch (item.type) {
          case 'coin':
            drawCoin(ctx, item.x, item.y, item.size, item.rotation, item.opacity);
            break;
          case 'cash':
            drawCash(ctx, item.x, item.y, item.size, item.rotation, item.opacity);
            break;
          case 'diamond':
            drawDiamond(ctx, item.x, item.y, item.size, item.rotation, item.opacity);
            break;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    initItems();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="game-mode-select">
      <canvas 
        ref={canvasRef} 
        className="falling-money-canvas"
      />
      
      <div className="landing-content">
        <div className="snakepit-logo">
          <h1 className="snakepit-title neon-text neon-green">SNAKEPIT</h1>
          <p className="snakepit-subtitle neon-text neon-cyan">Where Serpents Strike Gold</p>
        </div>

        <div className="game-stats">
          <div className="stat-card">
            <div className="stat-number neon-text neon-green">15</div>
            <div className="stat-label">AI Opponents</div>
          </div>
          <div className="stat-card">
            <div className="stat-number neon-text neon-cyan">∞</div>
            <div className="stat-label">Cash to Earn</div>
          </div>
          <div className="stat-card">
            <div className="stat-number neon-text neon-pink">2</div>
            <div className="stat-label">Game Modes</div>
          </div>
        </div>

        <div className="mode-selection">
          <h2 className="mode-selection-title neon-text neon-purple">Choose Your Pit</h2>
          
          <div className="mode-buttons">
            <button
              className="mode-button classic-mode"
              onClick={() => onModeSelect('classic')}
            >
              <div className="mode-icon">🐍</div>
              <h3>Classic Pit</h3>
              <p>Traditional snake gameplay with cash rewards and energy orbs</p>
              <div className="mode-features">
                <span>• 15 AI Snakes</span>
                <span>• Cash Collection</span>
                <span>• Boost System</span>
              </div>
            </button>

            <button
              className="mode-button combat-mode"
              onClick={() => onModeSelect('warfare')}
            >
              <div className="mode-icon">⚔️</div>
              <h3>Combat Pit</h3>
              <p>High-stakes combat mode with weapons and explosive payouts</p>
              <div className="mode-features">
                <span>• Weapon System</span>
                <span>• PvP Combat</span>
                <span>• Power-ups</span>
              </div>
            </button>
          </div>
        </div>

        <div className="game-features">
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <h4>Cash System</h4>
              <p>Collect cash instead of points for that retro arcade feel</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h4>Boost Power</h4>
              <p>Use mouse clicks or space to boost your snake's speed</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <h4>Smart AI</h4>
              <p>Battle against 15 intelligent AI snakes with unique behaviors</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎮</div>
              <h4>Retro Style</h4>
              <p>Dark theme with neon effects and pixelated graphics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameModeSelect;