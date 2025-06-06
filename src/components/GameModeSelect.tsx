import React, { useEffect, useRef, useState } from 'react';
import { GameMode } from '../App';
import AudioManager from '../utils/AudioManager';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import Leaderboard from './Leaderboard';
import UserProfile from './UserProfile';
import { addTransaction } from '../lib/supabase';
import { GameStatsService } from '../services/GameStatsService';
import { Settings } from './Settings';
import { Help } from './Help';
import { Glossary } from './Glossary';
import { About } from './About';
import { CryptoManager } from './CryptoManager';

interface GameModeSelectProps {
  onModeSelect: (mode: GameMode, userData: UserData) => void;
}

interface UserData {
  username: string;
  wager: number;
  xrpBalance: number;
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
  bounce: number; // For cartoon bounce effect
  bounceSpeed: number;
}

interface LogoSnake {
  segments: { x: number; y: number }[];
  color: string;
  size: number;
  speed: number;
  angle: number;
  pathProgress: number; // 0-1 around the border
  direction: 1 | -1; // 1 for clockwise, -1 for counter-clockwise
}

const GameModeSelect: React.FC<GameModeSelectProps> = ({ onModeSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoSnakesCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const logoSnakesAnimationRef = useRef<number | undefined>(undefined);
  const itemsRef = useRef<FallingItem[]>([]);
  const logoSnakesRef = useRef<LogoSnake[]>([]);

  // Auth context
  const { user, userProfile, updateProfile, loading: authLoading } = useAuth();

  // Debug logging for auth state
  useEffect(() => {
    console.log('🎮 GameModeSelect: Auth state update')
    console.log('  User:', user ? `✅ ${user.id}` : '❌ None')
    console.log('  Profile:', userProfile ? `✅ ${userProfile.username}` : '❌ None')
    console.log('  Loading:', authLoading)
  }, [user, userProfile, authLoading]);

  // Multi-stage state management
  const [currentStage, setCurrentStage] = useState<'play-now' | 'user-setup'>('play-now');

  // Tab system state
  const [activeTab, setActiveTab] = useState<'start-game' | 'shop' | 'inventory' | 'friends' | 'more'>('start-game');
  const [userData, setUserData] = useState<UserData>({
    username: '',
    wager: 50,
    xrpBalance: 1000.00
  });

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showCryptoManager, setShowCryptoManager] = useState(false);

  // Audio control state
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);

  // Update userData when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setUserData({
        username: userProfile.username,
        wager: 50, // Default wager
        xrpBalance: userProfile.xrp_balance
      });
      // Update audio settings from profile
      setIsMuted(userProfile.audio_muted);
      setVolume(userProfile.audio_volume);
    }
  }, [userProfile]);

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

    // Performance optimizations
    let lastFrameTime = 0;
    const targetFPS = 30; // Limit to 30 FPS for better performance
    const frameInterval = 1000 / targetFPS;

    // Initialize falling items - reduced count for better performance
    const initItems = () => {
      itemsRef.current = [];
      for (let i = 0; i < 25; i++) { // Reduced from 50 to 25
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
        rotationSpeed: (Math.random() - 0.5) * 0.15, // Slightly faster rotation for cartoon effect
        type: types[Math.floor(Math.random() * types.length)],
        size: 25 + Math.random() * 35, // Slightly bigger for cartoon effect
        opacity: 0.6 + Math.random() * 0.4, // Higher minimum opacity for more vibrant look
        bounce: 0,
        bounceSpeed: 0.1 + Math.random() * 0.1 // Random bounce speed for variety
      };
    };

    const drawCoin = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      // Outer coin body - bright cartoon yellow
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();

      // Bold black outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner circle - slightly darker yellow
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Inner circle outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cartoon snake symbol - big and bold
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${size * 1.4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐍', 0, 0);

      // Add cartoon shine effect
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-size * 0.3, -size * 0.3, size * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawCash = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      // Cash bill - bright cartoon green
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(-size, -size * 0.6, size * 2, size * 1.2);

      // Bold black border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeRect(-size, -size * 0.6, size * 2, size * 1.2);

      // Inner decorative border - cartoon style
      ctx.strokeStyle = '#008000';
      ctx.lineWidth = 2;
      ctx.strokeRect(-size * 0.8, -size * 0.4, size * 1.6, size * 0.8);

      // Cartoon snake symbol - big and bold
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${size * 1.2}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐍', 0, 0);

      // Add cartoon corner decorations
      const cornerSize = size * 0.2;
      ctx.fillStyle = '#008000';
      // Top corners
      ctx.fillRect(-size * 0.9, -size * 0.5, cornerSize, cornerSize);
      ctx.fillRect(size * 0.7, -size * 0.5, cornerSize, cornerSize);
      // Bottom corners
      ctx.fillRect(-size * 0.9, size * 0.3, cornerSize, cornerSize);
      ctx.fillRect(size * 0.7, size * 0.3, cornerSize, cornerSize);

      ctx.restore();
    };

    const drawDiamond = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      // Diamond body - bright cartoon pink/magenta
      ctx.fillStyle = '#FF00FF';
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.7, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.7, 0);
      ctx.closePath();
      ctx.fill();

      // Bold black outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner diamond facets - cartoon style
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.7);
      ctx.lineTo(size * 0.5, 0);
      ctx.lineTo(0, size * 0.7);
      ctx.lineTo(-size * 0.5, 0);
      ctx.closePath();
      ctx.fill();

      // Multiple cartoon sparkles
      ctx.fillStyle = '#FFFFFF';
      // Main sparkle
      ctx.beginPath();
      ctx.arc(-size * 0.2, -size * 0.4, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      // Secondary sparkle
      ctx.beginPath();
      ctx.arc(size * 0.3, -size * 0.2, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Small sparkle
      ctx.beginPath();
      ctx.arc(-size * 0.1, size * 0.3, size * 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Optimized sparkles function - reduced complexity for better performance
    const drawSparkles = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = 0.8;

      // Draw simplified sparkles (circles instead of complex stars)
      for (let i = 0; i < 3; i++) {
        const angle = (time * 0.02 + i * Math.PI * 2 / 3);
        const sparkleX = Math.cos(angle) * (size * 1.5);
        const sparkleY = Math.sin(angle) * (size * 1.5);
        const sparkleSize = 2 + Math.sin(time * 0.1 + i) * 1;

        // Simple circle sparkle instead of complex star
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const animate = (currentTime: number) => {
      // Frame rate limiting for better performance
      if (currentTime - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cache time calculation outside the loop
      const time = currentTime;

      // Update and draw items
      itemsRef.current.forEach((item, index) => {
        // Update position
        item.x += item.vx;
        item.y += item.vy;
        item.rotation += item.rotationSpeed;

        // Update bounce effect for cartoon feel
        item.bounce += item.bounceSpeed;
        const bounceOffset = Math.sin(item.bounce) * 3; // Small bounce effect
        const currentSize = item.size + bounceOffset; // Size varies with bounce

        // Reset if off screen
        if (item.y > canvas.height + 100) {
          itemsRef.current[index] = createRandomItem();
          return;
        }

        // Reduce sparkle frequency for better performance (every 4th frame)
        if (index % 4 === Math.floor(time / frameInterval) % 4) {
          drawSparkles(ctx, item.x, item.y, currentSize, time + index * 1000);
        }

        // Draw based on type with bounce effect
        switch (item.type) {
          case 'coin':
            drawCoin(ctx, item.x, item.y, currentSize, item.rotation, item.opacity);
            break;
          case 'cash':
            drawCash(ctx, item.x, item.y, currentSize, item.rotation, item.opacity);
            break;
          case 'diamond':
            drawDiamond(ctx, item.x, item.y, currentSize, item.rotation, item.opacity);
            break;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    initItems();
    animate(0); // Start with initial time of 0

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Logo Snakes Animation
  useEffect(() => {
    const canvas = logoSnakesCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Performance optimizations for logo snakes
    let lastLogoFrameTime = 0;
    const logoTargetFPS = 30; // Limit to 30 FPS for better performance
    const logoFrameInterval = 1000 / logoTargetFPS;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create two snakes
    const createLogoSnake = (color: string, direction: 1 | -1, startProgress: number): LogoSnake => {
      const snake: LogoSnake = {
        segments: [],
        color,
        size: 16, // Increased from 12 to 16 for bigger snakes
        speed: 0.003, // Slow movement around border
        angle: 0,
        pathProgress: startProgress,
        direction
      };

      // Initialize with 8 segments for longer snakes
      for (let i = 0; i < 8; i++) {
        snake.segments.push({ x: 0, y: 0 });
      }

      return snake;
    };

    logoSnakesRef.current = [
      createLogoSnake('#00ff41', 1, 0), // Green snake, clockwise, start at top-left
      createLogoSnake('#00ffff', 1, 0.33), // Cyan snake, also clockwise, start at 1/3 around
      createLogoSnake('#ff0080', 1, 0.66) // Hot pink snake, also clockwise, start at 2/3 around
    ];

    // Get position on border path
    const getBorderPosition = (progress: number, canvasWidth: number, canvasHeight: number) => {
      const margin = 20; // Distance from edge
      const w = canvasWidth - margin * 2;
      const h = (canvasHeight - margin * 2) * 0.85; // Reduce height by 15% (less compression)
      const perimeter = (w + h) * 2;

      // Normalize progress to 0-1
      progress = ((progress % 1) + 1) % 1;

      const distance = progress * perimeter;

      if (distance < w) {
        // Top edge
        return {
          x: margin + distance,
          y: margin,
          angle: 0
        };
      } else if (distance < w + h) {
        // Right edge
        return {
          x: margin + w,
          y: margin + (distance - w),
          angle: Math.PI / 2
        };
      } else if (distance < w * 2 + h) {
        // Bottom edge
        return {
          x: margin + w - (distance - w - h),
          y: margin + h,
          angle: Math.PI
        };
      } else {
        // Left edge
        return {
          x: margin,
          y: margin + h - (distance - w * 2 - h),
          angle: -Math.PI / 2
        };
      }
    };

    // Draw game-style snake
    const drawGameSnake = (snake: LogoSnake) => {
      if (snake.segments.length < 2) return;

      // Draw unified outline (like in game)
      ctx.strokeStyle = snake.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = snake.size * 2;

      // Draw body outline
      ctx.beginPath();
      for (let i = 1; i < snake.segments.length; i++) {
        const segment = snake.segments[i];
        if (i === 1) {
          ctx.moveTo(segment.x, segment.y);
        } else {
          ctx.lineTo(segment.x, segment.y);
        }
      }
      ctx.stroke();

      // Draw head outline (wider)
      const head = snake.segments[0];
      ctx.lineWidth = snake.size * 2.8;
      ctx.beginPath();
      if (snake.segments.length > 1) {
        const neck = snake.segments[1];
        ctx.moveTo(neck.x, neck.y);
        ctx.lineTo(head.x, head.y);
      }
      ctx.stroke();

      // Draw black interior
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = snake.size * 1.6;
      ctx.beginPath();
      for (let i = 1; i < snake.segments.length; i++) {
        const segment = snake.segments[i];
        if (i === 1) {
          ctx.moveTo(segment.x, segment.y);
        } else {
          ctx.lineTo(segment.x, segment.y);
        }
      }
      ctx.stroke();

      // Draw head interior
      ctx.lineWidth = snake.size * 2.4;
      ctx.beginPath();
      if (snake.segments.length > 1) {
        const neck = snake.segments[1];
        ctx.moveTo(neck.x, neck.y);
        ctx.lineTo(head.x, head.y);
      }
      ctx.stroke();

      // Draw center dots
      for (let i = 0; i < snake.segments.length; i++) {
        const segment = snake.segments[i];
        const dotSize = i === 0 ? snake.size * 0.25 : snake.size * 0.15;

        ctx.fillStyle = snake.color;
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw eyes on head
      const eyeSize = snake.size * 0.15;
      const eyeDistance = snake.size * 0.4;
      const eyeAngle = snake.angle + Math.PI / 2;

      const leftEyeX = head.x + Math.cos(eyeAngle) * eyeDistance;
      const leftEyeY = head.y + Math.sin(eyeAngle) * eyeDistance;
      const rightEyeX = head.x - Math.cos(eyeAngle) * eyeDistance;
      const rightEyeY = head.y - Math.sin(eyeAngle) * eyeDistance;

      // Cyan eyes
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();

      // Red pupils
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(leftEyeX, leftEyeY, eyeSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightEyeX, rightEyeY, eyeSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    };

    const animateLogoSnakes = (currentTime: number) => {
      // Frame rate limiting for better performance
      if (currentTime - lastLogoFrameTime < logoFrameInterval) {
        logoSnakesAnimationRef.current = requestAnimationFrame(animateLogoSnakes);
        return;
      }
      lastLogoFrameTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      logoSnakesRef.current.forEach(snake => {
        // Update snake position
        snake.pathProgress += snake.speed * snake.direction;

        // Get head position
        const headPos = getBorderPosition(snake.pathProgress, canvas.width, canvas.height);
        snake.angle = headPos.angle;
        snake.segments[0] = { x: headPos.x, y: headPos.y };

        // Update body segments to follow head
        for (let i = 1; i < snake.segments.length; i++) {
          const segmentDistance = snake.size * 1.5;
          const targetProgress = snake.pathProgress - (i * segmentDistance) / ((canvas.width + canvas.height) * 2) * snake.direction;
          const segmentPos = getBorderPosition(targetProgress, canvas.width, canvas.height);

          // Smooth interpolation
          const current = snake.segments[i];
          const dx = segmentPos.x - current.x;
          const dy = segmentPos.y - current.y;
          current.x += dx * 0.3;
          current.y += dy * 0.3;
        }

        drawGameSnake(snake);
      });

      logoSnakesAnimationRef.current = requestAnimationFrame(animateLogoSnakes);
    };

    animateLogoSnakes(0); // Start with initial time of 0

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (logoSnakesAnimationRef.current) {
        cancelAnimationFrame(logoSnakesAnimationRef.current);
      }
    };
  }, []);

  // Audio is now initialized by LegalOverlay, so no need to initialize here

  // Handler functions
  const handlePlayNowClick = () => {
    // Check if user is authenticated
    if (!user) {
      console.log('🔐 User not authenticated, showing auth modal');
      setShowAuthModal(true);
      return;
    }

    // Check if user profile is loaded
    if (!userProfile) {
      console.log('⏳ User profile loading, please wait...');
      // Could show a loading state here
      return;
    }

    console.log('✅ User authenticated, proceeding to game setup');
    setCurrentStage('user-setup');
  };

  const handleBackToPlayNow = () => {
    setCurrentStage('play-now');
  };

  const handleModeSelect = async (mode: GameMode) => {
    if (!user || !userProfile) {
      setShowAuthModal(true);
      return;
    }

    if (userData.username.trim() === '') {
      alert('Please enter a username');
      return;
    }

    // Check if user has enough balance for wager
    if (userData.xrpBalance < userData.wager) {
      alert('Insufficient balance for this wager amount');
      return;
    }

    try {
      console.log('🎮 Starting secure game with wager:', userData.wager);

      // Use secure wager function instead of manual balance manipulation
      const wagerResult = await GameStatsService.startGame(mode as 'classic' | 'warfare', userData.wager);

      if (!wagerResult.success) {
        alert(`Failed to start game: ${wagerResult.error}`);
        return;
      }

      console.log('🎮 Wager deducted successfully:', wagerResult);

      // Update local userData with new balance
      setUserData(prev => ({
        ...prev,
        xrpBalance: wagerResult.new_balance || prev.xrpBalance
      }));

      // Trigger profile refresh to update the UI
      window.dispatchEvent(new CustomEvent('profileRefresh'));

      // Transition to game music
      const audioManager = AudioManager.getInstance();
      await audioManager.playTrack('game', {
        volume: 0.5,
        loop: true,
        fadeInDuration: 1500,
        fadeOutDuration: 1000
      });
      console.log('Transitioned to game music');

      // Proceed to game with updated userData
      onModeSelect(mode, {
        ...userData,
        xrpBalance: wagerResult.new_balance || userData.xrpBalance
      });
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData(prev => ({ ...prev, username: e.target.value }));
  };

  const handleWagerSelect = (wager: number) => {
    setUserData(prev => ({ ...prev, wager }));
  };

  const handleDeposit = async () => {
    if (!user || !userProfile) return;

    try {
      // Simulate deposit - in real app this would connect to XRP wallet
      const depositAmount = 100;
      const newBalance = userData.xrpBalance + depositAmount;

      // Record transaction
      await addTransaction({
        user_id: user.id,
        type: 'deposit',
        amount: depositAmount,
        description: 'XRP wallet deposit'
      });

      // Update profile
      await updateProfile({ xrp_balance: newBalance });

      setUserData(prev => ({ ...prev, xrpBalance: newBalance }));
    } catch (error) {
      console.error('Error processing deposit:', error);
      alert('Failed to process deposit');
    }
  };

  const handleCashout = async () => {
    if (!user || !userProfile) return;

    const cashoutAmount = 50;
    if (userData.xrpBalance < cashoutAmount) {
      alert('Insufficient balance for cashout');
      return;
    }

    try {
      // Simulate cashout - in real app this would transfer to XRP wallet
      const newBalance = userData.xrpBalance - cashoutAmount;

      // Record transaction
      await addTransaction({
        user_id: user.id,
        type: 'withdrawal',
        amount: cashoutAmount,
        description: 'XRP wallet withdrawal'
      });

      // Update profile
      await updateProfile({ xrp_balance: newBalance });

      setUserData(prev => ({ ...prev, xrpBalance: newBalance }));
    } catch (error) {
      console.error('Error processing cashout:', error);
      alert('Failed to process cashout');
    }
  };

  // Navigation handlers
  const handleLeaderboardClick = () => {
    setShowLeaderboard(true);
  };

  const handleAuthSuccess = () => {
    console.log('🎉 Authentication successful!');
    setShowAuthModal(false);

    // Small delay to let the user see the success state
    setTimeout(() => {
      // If user was trying to play, proceed to user setup
      if (currentStage === 'play-now') {
        console.log('🚀 Proceeding to game setup...');
        setCurrentStage('user-setup');
      }
    }, 500);
  };

  // Audio control handlers
  const handleToggleMute = async () => {
    const audioManager = AudioManager.getInstance();
    const newMutedState = audioManager.toggleMute();
    setIsMuted(newMutedState);

    // Save to profile if user is logged in
    if (user) {
      await updateProfile({ audio_muted: newMutedState });
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    const audioManager = AudioManager.getInstance();
    audioManager.setMasterVolume(newVolume);
    setVolume(newVolume);

    // Save to profile if user is logged in
    if (user) {
      await updateProfile({ audio_volume: newVolume });
    }
  };

  const wagerOptions = [25, 50, 100, 250, 500];

  return (
    <div className="game-mode-select">
      {/* Animated Background Colors */}
      <div className="animated-background"></div>

      <canvas
        ref={canvasRef}
        className="falling-money-canvas"
      />

      {/* User Status Indicator - Top Right for Play Now Screen */}
      {currentStage === 'play-now' && (
        <div className="top-user-status">
          {user && userProfile ? (
            <button
              onClick={() => setShowProfile(true)}
              className="user-status neon-text neon-green"
              title="View Profile"
            >
              👤 {userProfile.username} | 💎 {userProfile.xrp_balance.toFixed(2)}
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="login-button neon-button neon-pink"
            >
              🔐 Login
            </button>
          )}

          {/* Audio Controls */}
          <div className="audio-controls">
            <button
              className="audio-btn neon-button neon-purple"
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <div className="volume-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="volume-slider"
                title="Volume"
              />
            </div>
          </div>
        </div>
      )}

      {currentStage === 'play-now' ? (
        // Play Now Screen - Improved Layout
        <div className="landing-content">
          <div className="landing-container">
            {/* Main Hero Section */}
            <div className="hero-section">
              <div className="snakepit-logo">
                {/* Game-style Animated Snakes around the border */}
                <canvas
                  ref={logoSnakesCanvasRef}
                  className="logo-snakes-canvas"
                  width="800"
                  height="400"
                />

                <pre className="ascii-logo neon-text neon-green">
{`
╔══════════════════════════════════════════════════════════════════════╗
║  ~~o                                                            o~~  ║
║                                                                      ║
║  ██████  ███    ██  █████  ██   ██ ███████ ██████  ██ ████████       ║
║ ██       ████   ██ ██   ██ ██  ██  ██      ██   ██ ██    ██          ║
║ ███████  ██ ██  ██ ███████ █████   █████   █████   ██    ██          ║
║      ██  ██  ██ ██ ██   ██ ██  ██  ██      ██      ██    ██          ║
║ ███████  ██   ████ ██   ██ ██   ██ ███████ ██      ██    ██          ║
║                                                                      ║
║  ~~o                                                            o~~  ║
╚══════════════════════════════════════════════════════════════════════╝
`}
                </pre>
                <p className="snakepit-subtitle neon-text neon-cyan">Where Serpents Strike Gold</p>
              </div>

              <div className="hero-content">
                <h1 className="hero-title neon-text neon-yellow">Enter the Ultimate Snake Arena</h1>
                <p className="hero-description">
                  <span className="neon-text neon-cyan">Be the Best.</span> <span className="neon-text neon-pink">Win Some Cash.</span>
                </p>

                <div className="cta-section">
                  <button
                    className="play-now-button neon-button neon-green"
                    onClick={handlePlayNowClick}
                    disabled={authLoading}
                  >
                    {authLoading ? '⏳ Loading...' :
                     !user ? '🔐 START PLAYING' :
                     '🎮 START PLAYING'}
                  </button>
                  <p className="cta-subtitle neon-text neon-dim">
                    {!user ? 'Sign up or login to play • Real money rewards' :
                     'Pay to play • No downloads required'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // User Setup Screen - New Tab Layout
        <div className="user-setup-container">
          {/* Main Content Area with Tabs */}
          <div className="main-content-area">
            {/* Left Sidebar - Navigation Tabs */}
            <div className="left-sidebar">
              <div className="nav-tabs">
                <button
                  className="back-button nav-tab neon-button neon-orange"
                  onClick={handleBackToPlayNow}
                >
                  ← Back
                </button>
                <button
                  className={`nav-tab ${activeTab === 'start-game' ? 'active' : ''}`}
                  onClick={() => setActiveTab('start-game')}
                >
                  🎮 Start Game
                </button>
                <button
                  className={`nav-tab ${activeTab === 'shop' ? 'active' : ''}`}
                  onClick={() => setActiveTab('shop')}
                >
                  🛒 Shop
                </button>
                <button
                  className={`nav-tab ${activeTab === 'inventory' ? 'active' : ''}`}
                  onClick={() => setActiveTab('inventory')}
                >
                  🎒 Inventory
                </button>
                <button
                  className={`nav-tab ${activeTab === 'friends' ? 'active' : ''}`}
                  onClick={() => setActiveTab('friends')}
                >
                  👥 Friends
                </button>
                <button
                  className={`nav-tab ${activeTab === 'more' ? 'active' : ''}`}
                  onClick={() => setActiveTab('more')}
                >
                  ⚙️ More
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
              {activeTab === 'start-game' && (
                <div className="start-game-content">
                  {/* Header with Title and User Info */}
                  <div className="start-game-header">
                    <h1 className="pit-title neon-text neon-magenta">⚔️ Enter the Pit</h1>
                    <div className="user-info-bar">
                      <button
                        className="username-btn neon-button neon-green"
                        onClick={() => setShowProfile(true)}
                        title="View Profile"
                      >
                        👤 {userProfile?.username}
                      </button>
                      <button
                        className="balance-btn neon-button neon-yellow"
                        onClick={() => setShowCryptoManager(true)}
                        title="Manage Crypto"
                      >
                        💎 {userData.xrpBalance.toFixed(2)} XRP
                      </button>
                    </div>
                  </div>

                  {/* Game Setup Content */}
                  <div className="setup-card">
            {/* Step 1: Username */}
            <div className="setup-step">
              <div className="step-header">
                <span className="step-number neon-text neon-purple">1</span>
                <h3 className="step-title neon-text neon-purple">Choose Your Snake Name</h3>
              </div>
              <input
                type="text"
                className="snake-name-input neon-input neon-purple"
                placeholder="Enter your snake name..."
                value={userData.username}
                onChange={handleUsernameChange}
                maxLength={20}
              />
            </div>

            {/* Step 2: Wager */}
            <div className="setup-step">
              <div className="step-header">
                <span className="step-number neon-text neon-green">2</span>
                <h3 className="step-title neon-text neon-green">Select Your Wager</h3>
              </div>
              <div className="wager-grid">
                {wagerOptions.map((amount) => (
                  <button
                    key={amount}
                    className={`wager-chip ${userData.wager === amount ? 'selected' : ''} ${userData.xrpBalance < amount ? 'disabled' : ''}`}
                    onClick={() => handleWagerSelect(amount)}
                    disabled={userData.xrpBalance < amount}
                  >
                    <span className="chip-amount">${amount}</span>
                    <span className="chip-label">XRP</span>
                  </button>
                ))}
              </div>
              <div className="wager-summary neon-text neon-dim">
                Selected: <span className="neon-text neon-yellow">${userData.wager}</span> |
                Available: <span className="neon-text neon-green">{userData.xrpBalance.toFixed(2)} XRP</span>
              </div>
            </div>

            {/* Step 3: Game Mode */}
            <div className="setup-step">
              <div className="step-header">
                <span className="step-number neon-text neon-cyan">3</span>
                <h3 className="step-title neon-text neon-cyan">Choose Your Battle</h3>
              </div>
              <div className="mode-selection-grid">
                <button
                  className="mode-card classic-mode"
                  onClick={() => handleModeSelect('classic')}
                  disabled={userData.username.trim() === ''}
                >
                  <div className="mode-icon">🐍</div>
                  <div className="mode-info">
                    <h4>Classic Pit</h4>
                    <p>Traditional gameplay with cash collection</p>
                    <div className="mode-features">
                      <span>• 15 AI Snakes</span>
                      <span>• Cash & Orbs</span>
                      <span>• Boost System</span>
                    </div>
                  </div>
                </button>

                <button
                  className="mode-card combat-mode"
                  onClick={() => handleModeSelect('warfare')}
                  disabled={userData.username.trim() === ''}
                >
                  <div className="mode-icon">⚔️</div>
                  <div className="mode-info">
                    <h4>Combat Pit</h4>
                    <p>High-stakes warfare with weapons</p>
                    <div className="mode-features">
                      <span>• Weapon System</span>
                      <span>• PvP Combat</span>
                      <span>• Power-ups</span>
                    </div>
                  </div>
                </button>
              </div>

              {userData.username.trim() === '' && (
                <div className="setup-warning neon-text neon-orange">
                  ⚠️ Enter a snake name to continue
                </div>
              )}
            </div>
                  </div>
                </div>
              )}

              {activeTab === 'shop' && (
                <div className="shop-content">
                  <h2 className="content-title neon-text neon-cyan">🛒 Shop</h2>
                  <p className="content-description neon-text neon-dim">
                    Purchase cosmetic items, power-ups, and exclusive content
                  </p>
                  <div className="shop-grid">
                    <div className="shop-item">
                      <div className="item-icon">🐍</div>
                      <h3>Snake Skins</h3>
                      <p>Customize your snake's appearance</p>
                      <button className="buy-btn neon-button neon-green">Browse</button>
                    </div>
                    <div className="shop-item">
                      <div className="item-icon">⚡</div>
                      <h3>Power-ups</h3>
                      <p>Temporary boosts and abilities</p>
                      <button className="buy-btn neon-button neon-yellow">Browse</button>
                    </div>
                    <div className="shop-item">
                      <div className="item-icon">🎯</div>
                      <h3>Weapon Skins</h3>
                      <p>Unique weapon appearances</p>
                      <button className="buy-btn neon-button neon-purple">Browse</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="inventory-content">
                  <h2 className="content-title neon-text neon-cyan">🎒 Inventory</h2>
                  <p className="content-description neon-text neon-dim">
                    Manage your owned items and equipment
                  </p>
                  <div className="inventory-tabs">
                    <button className="inv-tab active">Skins</button>
                    <button className="inv-tab">Power-ups</button>
                    <button className="inv-tab">Weapons</button>
                  </div>
                  <div className="inventory-grid">
                    <div className="inventory-item equipped">
                      <div className="item-preview">🐍</div>
                      <span>Default Snake</span>
                      <span className="equipped-badge">Equipped</span>
                    </div>
                    <div className="inventory-item">
                      <div className="item-preview">🔒</div>
                      <span>Locked Item</span>
                      <button className="equip-btn">Unlock</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'friends' && (
                <div className="friends-content">
                  <h2 className="content-title neon-text neon-cyan">👥 Friends</h2>
                  <p className="content-description neon-text neon-dim">
                    Connect with other players and compete together
                  </p>
                  <div className="friends-actions">
                    <button className="friend-btn neon-button neon-green">Add Friend</button>
                    <button className="friend-btn neon-button neon-cyan">Find Players</button>
                  </div>
                  <div className="friends-list">
                    <div className="friend-item">
                      <div className="friend-avatar">🐍</div>
                      <div className="friend-info">
                        <span className="friend-name">SnakeKing42</span>
                        <span className="friend-status online">Online</span>
                      </div>
                      <button className="invite-btn neon-button neon-purple">Invite</button>
                    </div>
                    <div className="friend-item">
                      <div className="friend-avatar">🐍</div>
                      <div className="friend-info">
                        <span className="friend-name">VenomQueen</span>
                        <span className="friend-status offline">Offline</span>
                      </div>
                      <button className="invite-btn neon-button neon-dim" disabled>Offline</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'more' && (
                <div className="more-content">
                  <h2 className="content-title neon-text neon-cyan">⚙️ More</h2>
                  <p className="content-description neon-text neon-dim">
                    Additional features and settings
                  </p>
                  <div className="more-grid">
                    <button className="more-item neon-button neon-cyan">
                      <span className="more-icon">🏆</span>
                      <span>Achievements</span>
                    </button>
                    <button className="more-item neon-button neon-green">
                      <span className="more-icon">📊</span>
                      <span>Statistics</span>
                    </button>
                    <button className="more-item neon-button neon-purple">
                      <span className="more-icon">⚙️</span>
                      <span>Settings</span>
                    </button>
                    <button className="more-item neon-button neon-orange">
                      <span className="more-icon">❓</span>
                      <span>Help & Support</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Settings and Info */}
            <div className="right-sidebar">
              <div className="sidebar-links">
                <button
                  className="sidebar-link neon-button neon-cyan"
                  onClick={handleLeaderboardClick}
                >
                  🏆 Leaderboard
                </button>
                <button
                  className="sidebar-link neon-button neon-green"
                  onClick={() => setShowHelp(true)}
                >
                  ❓ Help
                </button>
                <button
                  className="sidebar-link neon-button neon-purple"
                  onClick={() => setShowSettings(true)}
                >
                  ⚙️ Settings
                </button>
                <button
                  className="sidebar-link neon-button neon-yellow"
                  onClick={() => setShowGlossary(true)}
                >
                  📚 Glossary
                </button>
                <button
                  className="sidebar-link neon-button neon-orange"
                  onClick={() => setShowAbout(true)}
                >
                  📖 About
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Leaderboard Modal */}
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      {/* User Profile Modal */}
      <UserProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Settings Modal */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Help Modal */}
      <Help
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Glossary Modal */}
      <Glossary
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
      />

      {/* About Modal */}
      <About
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      {/* Crypto Manager Modal */}
      <CryptoManager
        isOpen={showCryptoManager}
        onClose={() => setShowCryptoManager(false)}
      />
    </div>
  );
};

export default GameModeSelect;