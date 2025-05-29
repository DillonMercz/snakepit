import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../lib/supabase';
import '../snakepit-theme.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [settings, setSettings] = useState({
    username: '',
    audio_muted: false,
    audio_volume: 0.6,
    graphics_quality: 'high',
    show_fps: false,
    auto_cashout: false,
    auto_cashout_amount: 100,
    notifications_enabled: true,
    friend_requests: true,
    game_invites: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setSettings({
        username: userProfile.username || '',
        audio_muted: userProfile.audio_muted || false,
        audio_volume: userProfile.audio_volume || 0.6,
        graphics_quality: 'high', // Default since not in DB yet
        show_fps: false,
        auto_cashout: false,
        auto_cashout_amount: 100,
        notifications_enabled: true,
        friend_requests: true,
        game_invites: true
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user || !userProfile) return;

    setIsLoading(true);
    setMessage('');

    try {
      const success = await updateUserProfile(user.id, {
        username: settings.username,
        audio_muted: settings.audio_muted,
        audio_volume: settings.audio_volume
      });

      if (success) {
        await refreshProfile();
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content settings-modal">
        <div className="modal-header">
          <h2 className="modal-title neon-text neon-purple">⚙️ Settings</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Account Settings */}
          <div className="settings-section">
            <h3 className="section-title neon-text neon-cyan">👤 Account</h3>
            <div className="setting-item">
              <label className="setting-label">Username</label>
              <input
                type="text"
                value={settings.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="setting-input neon-input"
                maxLength={50}
              />
            </div>
          </div>

          {/* Audio Settings */}
          <div className="settings-section">
            <h3 className="section-title neon-text neon-cyan">🔊 Audio</h3>
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.audio_muted}
                  onChange={(e) => handleInputChange('audio_muted', e.target.checked)}
                  className="setting-checkbox"
                />
                Mute Audio
              </label>
            </div>
            <div className="setting-item">
              <label className="setting-label">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.audio_volume}
                onChange={(e) => handleInputChange('audio_volume', parseFloat(e.target.value))}
                className="setting-slider"
                disabled={settings.audio_muted}
              />
              <span className="setting-value">{Math.round(settings.audio_volume * 100)}%</span>
            </div>
          </div>

          {/* Graphics Settings */}
          <div className="settings-section">
            <h3 className="section-title neon-text neon-cyan">🎮 Graphics</h3>
            <div className="setting-item">
              <label className="setting-label">Graphics Quality</label>
              <select
                value={settings.graphics_quality}
                onChange={(e) => handleInputChange('graphics_quality', e.target.value)}
                className="setting-select neon-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="ultra">Ultra</option>
              </select>
            </div>
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.show_fps}
                  onChange={(e) => handleInputChange('show_fps', e.target.checked)}
                  className="setting-checkbox"
                />
                Show FPS Counter
              </label>
            </div>
          </div>

          {/* Game Settings */}
          <div className="settings-section">
            <h3 className="section-title neon-text neon-cyan">🎯 Game</h3>
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.auto_cashout}
                  onChange={(e) => handleInputChange('auto_cashout', e.target.checked)}
                  className="setting-checkbox"
                />
                Auto Cashout
              </label>
            </div>
            {settings.auto_cashout && (
              <div className="setting-item">
                <label className="setting-label">Auto Cashout Amount</label>
                <input
                  type="number"
                  value={settings.auto_cashout_amount}
                  onChange={(e) => handleInputChange('auto_cashout_amount', parseInt(e.target.value))}
                  className="setting-input neon-input"
                  min="10"
                  max="1000"
                />
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <h3 className="section-title neon-text neon-cyan">🔔 Notifications</h3>
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.notifications_enabled}
                  onChange={(e) => handleInputChange('notifications_enabled', e.target.checked)}
                  className="setting-checkbox"
                />
                Enable Notifications
              </label>
            </div>
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.friend_requests}
                  onChange={(e) => handleInputChange('friend_requests', e.target.checked)}
                  className="setting-checkbox"
                />
                Friend Requests
              </label>
            </div>
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.game_invites}
                  onChange={(e) => handleInputChange('game_invites', e.target.checked)}
                  className="setting-checkbox"
                />
                Game Invites
              </label>
            </div>
          </div>

          {message && (
            <div className={`settings-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="neon-button neon-purple"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            className="neon-button neon-dim"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
