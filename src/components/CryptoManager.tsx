import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addTransaction, updateUserProfile } from '../lib/supabase';
import '../snakepit-theme.css';

interface CryptoManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CryptoManager: React.FC<CryptoManagerProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'history'>('overview');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleDeposit = async () => {
    if (!user || !userProfile || !depositAmount) return;

    const amount = parseFloat(depositAmount);
    if (amount <= 0 || amount > 10000) {
      setMessage('Please enter a valid amount between 0.01 and 10,000 XRP');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      // In a real implementation, this would integrate with XRP wallet
      // For now, we'll simulate a successful deposit

      // Update user balance
      const balanceUpdated = await updateUserProfile(user.id, {
        xrp_balance: userProfile.xrp_balance + amount
      });

      if (balanceUpdated) {
        // Record the transaction
        const transactionAdded = await addTransaction({
          user_id: user.id,
          type: 'deposit',
          amount: amount,
          description: `XRP deposit - ${amount} XRP`
        });

        if (transactionAdded) {
          await refreshProfile();
          setMessage(`Successfully deposited ${amount} XRP to your account!`);
          setDepositAmount('');
          setTimeout(() => setMessage(''), 5000);
        } else {
          setMessage('Failed to record transaction. Please contact support.');
        }
      } else {
        setMessage('Failed to update balance. Please try again.');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      setMessage('Error processing deposit. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !userProfile || !withdrawAmount || !withdrawAddress) return;

    const amount = parseFloat(withdrawAmount);
    if (amount <= 0 || amount > userProfile.xrp_balance) {
      setMessage(`Please enter a valid amount between 0.01 and ${userProfile.xrp_balance} XRP`);
      return;
    }

    if (withdrawAddress.length < 25) {
      setMessage('Please enter a valid XRP wallet address');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      // In a real implementation, this would process XRP withdrawal
      // For now, we'll simulate a successful withdrawal

      // Update user balance (subtract withdrawal amount)
      const balanceUpdated = await updateUserProfile(user.id, {
        xrp_balance: userProfile.xrp_balance - amount
      });

      if (balanceUpdated) {
        // Record the transaction
        const transactionAdded = await addTransaction({
          user_id: user.id,
          type: 'withdrawal',
          amount: -amount,
          description: `XRP withdrawal to ${withdrawAddress.substring(0, 10)}...`
        });

        if (transactionAdded) {
          await refreshProfile();
          setMessage(`Successfully initiated withdrawal of ${amount} XRP to ${withdrawAddress.substring(0, 10)}...`);
          setWithdrawAmount('');
          setWithdrawAddress('');
          setTimeout(() => setMessage(''), 5000);
        } else {
          setMessage('Failed to record transaction. Please contact support.');
        }
      } else {
        setMessage('Failed to update balance. Please try again.');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      setMessage('Error processing withdrawal. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content crypto-manager-modal">
        <div className="modal-header">
          <h2 className="modal-title neon-text neon-yellow">💎 Crypto Manager</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Tab Navigation */}
          <div className="crypto-tabs">
            <button
              className={`crypto-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`crypto-tab ${activeTab === 'deposit' ? 'active' : ''}`}
              onClick={() => setActiveTab('deposit')}
            >
              💳 Deposit
            </button>
            <button
              className={`crypto-tab ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => setActiveTab('withdraw')}
            >
              🏧 Withdraw
            </button>
            <button
              className={`crypto-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              📜 History
            </button>
          </div>

          {/* Tab Content */}
          <div className="crypto-content">
            {activeTab === 'overview' && (
              <div className="overview-section">
                <div className="balance-display">
                  <h3 className="balance-title neon-text neon-cyan">Current Balance</h3>
                  <div className="balance-amount neon-text neon-yellow">
                    💎 {userProfile?.xrp_balance.toFixed(2)} XRP
                  </div>
                  <div className="balance-usd">
                    ≈ ${((userProfile?.xrp_balance || 0) * 0.52).toFixed(2)} USD
                  </div>
                </div>

                <div className="quick-actions">
                  <h4 className="section-subtitle neon-text neon-cyan">Quick Actions</h4>
                  <div className="action-buttons">
                    <button
                      className="action-btn neon-button neon-green"
                      onClick={() => setActiveTab('deposit')}
                    >
                      💳 Deposit XRP
                    </button>
                    <button
                      className="action-btn neon-button neon-orange"
                      onClick={() => setActiveTab('withdraw')}
                    >
                      🏧 Withdraw XRP
                    </button>
                  </div>
                </div>

                <div className="account-info">
                  <h4 className="section-subtitle neon-text neon-cyan">Account Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Account Type:</span>
                      <span className="info-value neon-text neon-green">Premium</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Daily Limit:</span>
                      <span className="info-value">10,000 XRP</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Withdrawal Fee:</span>
                      <span className="info-value">0.1 XRP</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Security Level:</span>
                      <span className="info-value neon-text neon-green">High</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deposit' && (
              <div className="deposit-section">
                <h3 className="section-title neon-text neon-green">💳 Deposit XRP</h3>

                <div className="deposit-form">
                  <div className="form-group">
                    <label className="form-label">Amount (XRP)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter amount to deposit"
                      className="crypto-input neon-input"
                      min="0.01"
                      max="10000"
                      step="0.01"
                    />
                  </div>

                  <div className="deposit-info">
                    <h4 className="info-title neon-text neon-cyan">Deposit Information</h4>
                    <ul className="info-list">
                      <li>Minimum deposit: 0.01 XRP</li>
                      <li>Maximum deposit: 10,000 XRP per day</li>
                      <li>No deposit fees</li>
                      <li>Funds available immediately</li>
                      <li>Deposits are processed on XRP Ledger</li>
                    </ul>
                  </div>

                  <button
                    className="crypto-action-btn neon-button neon-green"
                    onClick={handleDeposit}
                    disabled={isProcessing || !depositAmount}
                  >
                    {isProcessing ? 'Processing...' : 'Deposit XRP'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'withdraw' && (
              <div className="withdraw-section">
                <h3 className="section-title neon-text neon-orange">🏧 Withdraw XRP</h3>

                <div className="withdraw-form">
                  <div className="form-group">
                    <label className="form-label">Amount (XRP)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount to withdraw"
                      className="crypto-input neon-input"
                      min="0.01"
                      max={userProfile?.xrp_balance || 0}
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">XRP Wallet Address</label>
                    <input
                      type="text"
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      placeholder="Enter your XRP wallet address"
                      className="crypto-input neon-input"
                    />
                  </div>

                  <div className="withdraw-info">
                    <h4 className="info-title neon-text neon-cyan">Withdrawal Information</h4>
                    <ul className="info-list">
                      <li>Minimum withdrawal: 0.01 XRP</li>
                      <li>Maximum available: {userProfile?.xrp_balance.toFixed(2)} XRP</li>
                      <li>Network fee: 0.1 XRP</li>
                      <li>Processing time: 1-5 minutes</li>
                      <li>Withdrawals are irreversible</li>
                    </ul>
                  </div>

                  <button
                    className="crypto-action-btn neon-button neon-orange"
                    onClick={handleWithdraw}
                    disabled={isProcessing || !withdrawAmount || !withdrawAddress}
                  >
                    {isProcessing ? 'Processing...' : 'Withdraw XRP'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="history-section">
                <h3 className="section-title neon-text neon-cyan">📜 Transaction History</h3>

                <div className="transaction-list">
                  <div className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-type deposit">💳 Deposit</span>
                      <span className="transaction-amount neon-text neon-green">+100.00 XRP</span>
                    </div>
                    <div className="transaction-details">
                      <span className="transaction-date">2024-12-15 14:30</span>
                      <span className="transaction-status completed">Completed</span>
                    </div>
                  </div>

                  <div className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-type withdrawal">🏧 Withdrawal</span>
                      <span className="transaction-amount neon-text neon-orange">-50.00 XRP</span>
                    </div>
                    <div className="transaction-details">
                      <span className="transaction-date">2024-12-14 09:15</span>
                      <span className="transaction-status completed">Completed</span>
                    </div>
                  </div>

                  <div className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-type cashout">💰 Game Cashout</span>
                      <span className="transaction-amount neon-text neon-yellow">+25.50 XRP</span>
                    </div>
                    <div className="transaction-details">
                      <span className="transaction-date">2024-12-13 20:45</span>
                      <span className="transaction-status completed">Completed</span>
                    </div>
                  </div>
                </div>

                <div className="history-footer">
                  <button className="load-more-btn neon-button neon-dim">
                    Load More Transactions
                  </button>
                </div>
              </div>
            )}
          </div>

          {message && (
            <div className={`crypto-message ${message.includes('Success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="neon-button neon-yellow" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
