import React, { useState, useEffect } from 'react'
import { getLeaderboard, Leaderboard as LeaderboardType } from '../lib/supabase'
import CrownIcon from './CrownIcon'

interface LeaderboardProps {
  isOpen: boolean
  onClose: () => void
}

const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose }) => {
  const [gameMode, setGameMode] = useState<'classic' | 'warfare'>('classic')
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardType[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard()
    }
  }, [isOpen, gameMode])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const data = await getLeaderboard(gameMode, 20)
      setLeaderboardData(data)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return <CrownIcon size={20} animated={true} />
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  if (!isOpen) return null

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-modal">
        <div className="leaderboard-header">
          <h2 className="neon-text neon-yellow">🏆 Hall of Fame</h2>
          <button className="close-button neon-button neon-orange" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="leaderboard-controls">
          <div className="mode-selector">
            <button
              className={`mode-button ${gameMode === 'classic' ? 'active' : ''} neon-button neon-green`}
              onClick={() => setGameMode('classic')}
            >
              🐍 Classic Pit
            </button>
            <button
              className={`mode-button ${gameMode === 'warfare' ? 'active' : ''} neon-button neon-red`}
              onClick={() => setGameMode('warfare')}
            >
              ⚔️ Combat Pit
            </button>
          </div>
        </div>

        <div className="leaderboard-content">
          {loading ? (
            <div className="loading-state">
              <div className="neon-text neon-cyan">⏳ Loading champions...</div>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="empty-state">
              <div className="neon-text neon-dim">🎯 No champions yet!</div>
              <div className="neon-text neon-dim">Be the first to claim the throne!</div>
            </div>
          ) : (
            <div className="leaderboard-list">
              <div className="leaderboard-headers">
                <div className="rank-header neon-text neon-purple">Rank</div>
                <div className="name-header neon-text neon-cyan">Snake</div>
                <div className="score-header neon-text neon-yellow">High Score</div>
                <div className="cash-header neon-text neon-green">Max Cash</div>
              </div>
              
              {leaderboardData.map((entry, index) => (
                <div key={entry.id} className={`leaderboard-row ${index < 3 ? 'top-three' : ''}`}>
                  <div className="rank neon-text neon-purple">
                    {getRankEmoji(index + 1)}
                  </div>
                  <div className="username neon-text neon-cyan">
                    {entry.username}
                  </div>
                  <div className="score neon-text neon-yellow">
                    {formatNumber(entry.high_score)}
                  </div>
                  <div className="cash neon-text neon-green">
                    ${formatNumber(entry.high_cash)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="leaderboard-footer">
          <button
            className="refresh-button neon-button neon-cyan"
            onClick={loadLeaderboard}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <div className="leaderboard-info neon-text neon-dim">
            Updated in real-time • Top 20 players shown
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
