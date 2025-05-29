import React, { useState, useEffect } from 'react';

interface ControllerStatusProps {
  gameInstanceRef: React.RefObject<any>;
}

interface ConnectedController {
  index: number;
  id: string;
  type: string;
}

const ControllerStatus: React.FC<ControllerStatusProps> = ({ gameInstanceRef }) => {
  const [controllers, setControllers] = useState<ConnectedController[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if gamepad API is supported
    const supported = 'getGamepads' in navigator;
    setIsSupported(supported);

    if (!supported) return;

    const updateControllers = () => {
      const gamepads = navigator.getGamepads();
      const connectedControllers: ConnectedController[] = [];

      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad) {
          const type = detectControllerType(gamepad.id);
          connectedControllers.push({
            index: i,
            id: gamepad.id,
            type: type
          });
        }
      }

      setControllers(connectedControllers);
    };

    const detectControllerType = (id: string): string => {
      const idLower = id.toLowerCase();
      if (idLower.includes('xbox') || idLower.includes('xinput')) {
        return 'Xbox';
      } else if (idLower.includes('playstation') || idLower.includes('dualshock') || idLower.includes('dualsense')) {
        return 'PlayStation';
      }
      return 'Generic';
    };

    // Listen for gamepad events
    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log('Controller connected:', e.gamepad.id);
      updateControllers();
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log('Controller disconnected:', e.gamepad.id);
      updateControllers();
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Initial check
    updateControllers();

    // Cleanup
    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  const getControllerIcon = (type: string): string => {
    switch (type) {
      case 'Xbox': return '🎮';
      case 'PlayStation': return '🎮';
      default: return '🎮';
    }
  };

  const getControllerColor = (type: string): string => {
    switch (type) {
      case 'Xbox': return 'var(--neon-green)';
      case 'PlayStation': return 'var(--neon-cyan)';
      default: return 'var(--neon-purple)';
    }
  };

  if (!isSupported) {
    return null; // Don't show anything if gamepad API is not supported
  }

  return (
    <div className="controller-status">
      <div className="controller-header">
        <span className="controller-title">🎮 Controllers</span>
      </div>
      
      {controllers.length === 0 ? (
        <div className="no-controllers">
          <div className="controller-hint">No controllers detected</div>
          <div className="controller-instructions">
            <div>Connect an Xbox or PlayStation controller</div>
            <div>Press any button to activate</div>
          </div>
        </div>
      ) : (
        <div className="connected-controllers">
          {controllers.map((controller) => (
            <div key={controller.index} className="controller-item">
              <div 
                className="controller-icon"
                style={{ color: getControllerColor(controller.type) }}
              >
                {getControllerIcon(controller.type)}
              </div>
              <div className="controller-info">
                <div className="controller-type">{controller.type}</div>
                <div className="controller-id">Player {controller.index + 1}</div>
              </div>
              <div className="controller-status-indicator connected"></div>
            </div>
          ))}
        </div>
      )}

      {controllers.length > 0 && (
        <div className="controller-controls">
          <div className="control-section">
            <div className="control-title">Movement</div>
            <div className="control-item">Left Stick: Move snake</div>
          </div>
          
          <div className="control-section">
            <div className="control-title">Actions</div>
            <div className="control-item">A/Cross: Boost</div>
            <div className="control-item">RT/R2: Shoot</div>
            <div className="control-item">X/Square: Cash Out</div>
            <div className="control-item">Y/Triangle: Spectate Next</div>
          </div>
          
          <div className="control-section">
            <div className="control-title">Weapons</div>
            <div className="control-item">LB/L1: Primary</div>
            <div className="control-item">RB/R1: Secondary</div>
            <div className="control-item">LT/L2: Sidearm</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControllerStatus;
