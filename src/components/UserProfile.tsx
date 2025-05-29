import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserTransactions, Transaction } from '../lib/supabase'

interface UserProfileProps {
  isOpen: boolean
  onClose: () => void
}

interface ProfileTab {
  id: string
  name: string
  icon: string
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, updateProfile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    audioMuted: false,
    audioVolume: 0.6
  })

  const tabs: ProfileTab[] = [
    { id: 'overview', name: 'Overview', icon: '👤' },
    { id: 'inventory', name: 'Inventory', icon: '🎒' },
    { id: 'transactions', name: 'Transactions', icon: '💰' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'achievements', name: 'Achievements', icon: '🏆' }
  ]

  useEffect(() => {
    if (userProfile) {
      setFormData({
        username: userProfile.username,
        audioMuted: userProfile.audio_muted,
        audioVolume: userProfile.audio_volume
      })
    }
  }, [userProfile])

  useEffect(() => {
    if (isOpen && activeTab === 'transactions' && user) {
      loadTransactions()
    }
  }, [isOpen, activeTab, user])

  const loadTransactions = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getUserTransactions(user.id, 50)
      setTransactions(data)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !userProfile) return

    const success = await updateProfile({
      username: formData.username,
      audio_muted: formData.audioMuted,
      audio_volume: formData.audioVolume
    })

    if (success) {
      setEditMode(false)
      console.log('Profile updated successfully')
    } else {
      console.error('Failed to update profile')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💳'
      case 'withdrawal': return '🏦'
      case 'wager': return '🎲'
      case 'cashout': return '💰'
      default: return '📄'
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'neon-green'
      case 'withdrawal': return 'neon-orange'
      case 'wager': return 'neon-red'
      case 'cashout': return 'neon-yellow'
      default: return 'neon-dim'
    }
  }

  if (!isOpen || !user || !userProfile) return null

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <div className="profile-title">
            <h2 className="neon-text neon-cyan">🐍 Snake Profile</h2>
            <div className="profile-subtitle neon-text neon-dim">
              Welcome back, {userProfile.username}!
            </div>
          </div>
          <button className="close-button neon-button neon-orange" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="profile-content">
          {/* Tab Navigation */}
          <div className="profile-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`profile-tab ${activeTab === tab.id ? 'active' : ''} neon-button neon-purple`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="profile-tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <div className="profile-stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon neon-text neon-green">💎</div>
                    <div className="stat-info">
                      <div className="stat-label neon-text neon-dim">Balance</div>
                      <div className="stat-value neon-text neon-green">
                        {userProfile.xrp_balance.toFixed(2)} SOL
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon neon-text neon-yellow">🎮</div>
                    <div className="stat-info">
                      <div className="stat-label neon-text neon-dim">Games Played</div>
                      <div className="stat-value neon-text neon-yellow">
                        {userProfile.total_games_played}
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon neon-text neon-cyan">🏆</div>
                    <div className="stat-info">
                      <div className="stat-label neon-text neon-dim">Wins</div>
                      <div className="stat-value neon-text neon-cyan">
                        {userProfile.total_wins}
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon neon-text neon-pink">💰</div>
                    <div className="stat-info">
                      <div className="stat-label neon-text neon-dim">Total Earnings</div>
                      <div className="stat-value neon-text neon-pink">
                        {userProfile.total_earnings.toFixed(2)} SOL
                      </div>
                    </div>
                  </div>
                </div>

                <div className="profile-info-card">
                  <h3 className="neon-text neon-purple">Account Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label neon-text neon-dim">Username:</span>
                      <span className="info-value neon-text neon-cyan">{userProfile.username}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label neon-text neon-dim">Member Since:</span>
                      <span className="info-value neon-text neon-green">
                        {formatDate(userProfile.created_at)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label neon-text neon-dim">Win Rate:</span>
                      <span className="info-value neon-text neon-yellow">
                        {userProfile.total_games_played > 0 
                          ? ((userProfile.total_wins / userProfile.total_games_played) * 100).toFixed(1)
                          : '0'}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="inventory-content">
                <h3 className="neon-text neon-purple">🎒 Your Collection</h3>
                <div className="inventory-grid">
                  <div className="inventory-item coming-soon">
                    <div className="item-icon">🐍</div>
                    <div className="item-name neon-text neon-green">Snake Skins</div>
                    <div className="item-description neon-text neon-dim">Coming Soon</div>
                  </div>
                  <div className="inventory-item coming-soon">
                    <div className="item-icon">⚔️</div>
                    <div className="item-name neon-text neon-red">Weapons</div>
                    <div className="item-description neon-text neon-dim">Coming Soon</div>
                  </div>
                  <div className="inventory-item coming-soon">
                    <div className="item-icon">🛡️</div>
                    <div className="item-name neon-text neon-cyan">Power-ups</div>
                    <div className="item-description neon-text neon-dim">Coming Soon</div>
                  </div>
                  <div className="inventory-item coming-soon">
                    <div className="item-icon">🏆</div>
                    <div className="item-name neon-text neon-yellow">Badges</div>
                    <div className="item-description neon-text neon-dim">Coming Soon</div>
                  </div>
                </div>
                <div className="coming-soon-note neon-text neon-dim">
                  🚀 NFT items and collectibles will be available with Solana integration!
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="transactions-content">
                <div className="transactions-header">
                  <h3 className="neon-text neon-purple">💰 Transaction History</h3>
                  <button 
                    className="refresh-btn neon-button neon-cyan"
                    onClick={loadTransactions}
                    disabled={loading}
                  >
                    {loading ? '⏳' : '🔄'} Refresh
                  </button>
                </div>
                
                {loading ? (
                  <div className="loading-state neon-text neon-cyan">
                    ⏳ Loading transactions...
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="empty-state neon-text neon-dim">
                    📄 No transactions yet. Start playing to see your history!
                  </div>
                ) : (
                  <div className="transactions-list">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="transaction-item">
                        <div className="transaction-icon">
                          <span className={`neon-text ${getTransactionColor(transaction.type)}`}>
                            {getTransactionIcon(transaction.type)}
                          </span>
                        </div>
                        <div className="transaction-details">
                          <div className="transaction-type neon-text neon-cyan">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </div>
                          <div className="transaction-description neon-text neon-dim">
                            {transaction.description}
                          </div>
                          <div className="transaction-date neon-text neon-dim">
                            {formatDate(transaction.created_at)}
                          </div>
                        </div>
                        <div className={`transaction-amount neon-text ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'deposit' || transaction.type === 'cashout' ? '+' : '-'}
                          {transaction.amount.toFixed(2)} SOL
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="settings-content">
                <h3 className="neon-text neon-purple">⚙️ Account Settings</h3>
                
                <div className="settings-section">
                  <h4 className="neon-text neon-cyan">Profile Settings</h4>
                  <div className="setting-item">
                    <label className="setting-label neon-text neon-green">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      disabled={!editMode}
                      className="setting-input neon-input neon-green"
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="settings-section">
                  <h4 className="neon-text neon-cyan">Audio Settings</h4>
                  <div className="setting-item">
                    <label className="setting-label neon-text neon-yellow">
                      <input
                        type="checkbox"
                        checked={formData.audioMuted}
                        onChange={(e) => setFormData({...formData, audioMuted: e.target.checked})}
                        disabled={!editMode}
                        className="setting-checkbox"
                      />
                      Mute Audio
                    </label>
                  </div>
                  <div className="setting-item">
                    <label className="setting-label neon-text neon-yellow">Volume</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.audioVolume}
                      onChange={(e) => setFormData({...formData, audioVolume: parseFloat(e.target.value)})}
                      disabled={!editMode}
                      className="setting-slider"
                    />
                    <span className="volume-display neon-text neon-yellow">
                      {Math.round(formData.audioVolume * 100)}%
                    </span>
                  </div>
                </div>

                <div className="settings-actions">
                  {editMode ? (
                    <>
                      <button 
                        className="save-btn neon-button neon-green"
                        onClick={handleSaveProfile}
                      >
                        💾 Save Changes
                      </button>
                      <button 
                        className="cancel-btn neon-button neon-orange"
                        onClick={() => setEditMode(false)}
                      >
                        ❌ Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      className="edit-btn neon-button neon-cyan"
                      onClick={() => setEditMode(true)}
                    >
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>

                <div className="danger-zone">
                  <h4 className="neon-text neon-red">Danger Zone</h4>
                  <button 
                    className="signout-btn neon-button neon-red"
                    onClick={handleSignOut}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="achievements-content">
                <h3 className="neon-text neon-purple">🏆 Achievements</h3>
                <div className="achievements-grid">
                  <div className="achievement-item locked">
                    <div className="achievement-icon">🥇</div>
                    <div className="achievement-name neon-text neon-yellow">First Victory</div>
                    <div className="achievement-description neon-text neon-dim">Win your first game</div>
                    <div className="achievement-progress">
                      {userProfile.total_wins > 0 ? '✅ Unlocked' : '🔒 Locked'}
                    </div>
                  </div>
                  <div className="achievement-item locked">
                    <div className="achievement-icon">💰</div>
                    <div className="achievement-name neon-text neon-green">Big Winner</div>
                    <div className="achievement-description neon-text neon-dim">Earn 100+ SOL in total</div>
                    <div className="achievement-progress">
                      {userProfile.total_earnings >= 100 ? '✅ Unlocked' : '🔒 Locked'}
                    </div>
                  </div>
                  <div className="achievement-item locked">
                    <div className="achievement-icon">🎮</div>
                    <div className="achievement-name neon-text neon-cyan">Veteran Player</div>
                    <div className="achievement-description neon-text neon-dim">Play 50+ games</div>
                    <div className="achievement-progress">
                      {userProfile.total_games_played >= 50 ? '✅ Unlocked' : '🔒 Locked'}
                    </div>
                  </div>
                  <div className="achievement-item locked">
                    <div className="achievement-icon">🔥</div>
                    <div className="achievement-name neon-text neon-orange">Hot Streak</div>
                    <div className="achievement-description neon-text neon-dim">Win 5 games in a row</div>
                    <div className="achievement-progress">🔒 Coming Soon</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
