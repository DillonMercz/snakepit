import React, { useState, useEffect } from 'react';

interface StatusBarProps {
  gameInstanceRef: React.MutableRefObject<any>;
}

const StatusBar: React.FC<StatusBarProps> = ({ gameInstanceRef }) => {
  const [fps, setFps] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [hasController, setHasController] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      if (gameInstanceRef.current) {
        // Get FPS
        setFps(Math.round(gameInstanceRef.current.fps || 0));
        
        // Get connection status
        setIsConnected(gameInstanceRef.current.connected || false);
        
        // Get zoom level
        setZoom(gameInstanceRef.current.camera?.zoom || 1.0);
      }

      // Check for controllers
      if ('getGamepads' in navigator) {
        const gamepads = navigator.getGamepads();
        const hasConnectedController = Array.from(gamepads).some(gamepad => gamepad !== null);
        setHasController(hasConnectedController);
      }
    };

    // Update every second
    const interval = setInterval(updateStatus, 1000);
    
    // Initial update
    updateStatus();

    return () => clearInterval(interval);
  }, [gameInstanceRef]);

  return (
    <div className="status-bar">
      {/* Controller Status */}
      <div className={`status-item ${hasController ? 'connected' : 'disconnected'}`}>
        <span className="status-icon">🎮</span>
        <span className="status-text">{hasController ? 'Controller' : 'No Controller'}</span>
      </div>

      {/* FPS */}
      <div className="status-item">
        <span className="status-icon">📊</span>
        <span className="status-text">{fps} FPS</span>
      </div>

      {/* Connection Status */}
      <div className={`status-item ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-icon">{isConnected ? '🟢' : '🔴'}</span>
        <span className="status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {/* Zoom Level */}
      <div className="status-item">
        <span className="status-icon">🔍</span>
        <span className="status-text">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
};

export default StatusBar;
