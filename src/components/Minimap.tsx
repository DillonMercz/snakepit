import React, { useRef, useEffect } from 'react';

interface MinimapProps {
  gameInstanceRef: React.MutableRefObject<any>;
}

const Minimap: React.FC<MinimapProps> = ({ gameInstanceRef }) => {
  const minimapRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!minimapRef.current || !gameInstanceRef.current) return;

    // Connect the minimap canvas to the game instance
    if (gameInstanceRef.current.setMinimapCanvas) {
      gameInstanceRef.current.setMinimapCanvas(minimapRef.current);
    }
  }, [gameInstanceRef]);

  return (
    <div className="minimap-container">
      <canvas ref={minimapRef} className="minimap-canvas pixelated" />
    </div>
  );
};

export default Minimap;