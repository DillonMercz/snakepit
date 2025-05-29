import React, { useRef, useEffect } from 'react';

interface MinimapProps {
  gameInstanceRef: React.MutableRefObject<any>;
}

const Minimap: React.FC<MinimapProps> = ({ gameInstanceRef }) => {
  const minimapRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;

    const connectMinimap = () => {
      if (!minimapRef.current) {
        console.log('Minimap canvas not ready');
        return false;
      }

      if (!gameInstanceRef.current) {
        console.log('Game instance not ready, retry', retryCount + 1);
        return false;
      }

      // Connect the minimap canvas to the game instance
      if (gameInstanceRef.current.setMinimapCanvas) {
        console.log('Successfully connecting minimap canvas to game instance');
        gameInstanceRef.current.setMinimapCanvas(minimapRef.current);
        return true;
      } else {
        console.log('Game instance does not have setMinimapCanvas method');
        return false;
      }
    };

    const tryConnect = () => {
      if (connectMinimap()) {
        console.log('Minimap connected successfully');
        return;
      }

      retryCount++;
      if (retryCount < maxRetries) {
        setTimeout(tryConnect, 200 * retryCount); // Exponential backoff
      } else {
        console.log('Failed to connect minimap after', maxRetries, 'attempts');
      }
    };

    // Start connection attempts
    tryConnect();
  }, [gameInstanceRef]);

  return (
    <div className="minimap-container">
      <canvas ref={minimapRef} className="minimap-canvas pixelated" />
    </div>
  );
};

export default Minimap;