import React from 'react';

// Define PlayerData interface based on expected server structure
export interface PlayerData {
  id: string;
  username: string;
  score: number;
  cashBalance?: number;
  alive: boolean;
  // Add other relevant fields if available and needed by the scoreboard
  // For example: color?: string; isLocal?: boolean;
}

export interface ScoreboardProps {
  players: PlayerData[];
  localPlayerId?: string | null;
  gameMode: string | null;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players, localPlayerId, gameMode }) => {
  // Sort players by score (descending) or cashBalance if relevant for the mode
  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = (gameMode === 'classic_pvp' || gameMode === 'warfare_pvp') ? (a.cashBalance || 0) : a.score;
    const scoreB = (gameMode === 'classic_pvp' || gameMode === 'warfare_pvp') ? (b.cashBalance || 0) : b.score;
    return scoreB - scoreA;
  });

  return (
    <div className="scoreboard" style={{
      position: 'absolute',
      top: '70px', // Adjusted top to avoid overlap with GameUI stats
      right: '10px',
      backgroundColor: 'rgba(0,0,0,0.6)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      width: '220px', // Slightly wider
      fontFamily: 'monospace',
      fontSize: '12px',
      maxHeight: '300px', // Max height with scroll
      overflowY: 'auto'
    }}>
      <h4 style={{ marginTop: 0, marginBottom: '8px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>Scoreboard</h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {sortedPlayers.map((player, index) => (
          <li key={player.id} style={{
            padding: '3px 0',
            borderBottom: index < sortedPlayers.length - 1 ? '1px dashed #444' : 'none',
            color: player.alive ? (player.id === localPlayerId ? '#66ff66' : 'white') : '#888', // Highlight local player if alive
            fontWeight: player.id === localPlayerId ? 'bold' : 'normal'
          }}>
            <span style={{ display: 'inline-block', width: '70%' }}>
              {index + 1}. {player.username} {!player.alive && "(Defeated)"}
            </span>
            <span style={{ float: 'right', textAlign: 'right', width: '30%' }}>
              ${gameMode === 'classic_pvp' || gameMode === 'warfare_pvp' ? (player.cashBalance || 0).toLocaleString() : player.score.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Scoreboard;
