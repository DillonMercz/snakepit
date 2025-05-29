import React, { useState } from 'react';
import AudioManager from '../utils/AudioManager';

interface LegalOverlayProps {
  onComplete: () => void;
}

interface LegalConsents {
  ageConfirmation: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingOptIn: boolean;
}

const LegalOverlay: React.FC<LegalOverlayProps> = ({ onComplete }) => {
  const [consents, setConsents] = useState<LegalConsents>({
    ageConfirmation: false,
    termsAccepted: false,
    privacyAccepted: false,
    marketingOptIn: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if minimum required consents are given
  const canProceed = consents.ageConfirmation && consents.termsAccepted && consents.privacyAccepted;

  // Check if all boxes are checked
  const allChecked = Object.values(consents).every(consent => consent);

  const handleConsentChange = (key: keyof LegalConsents) => {
    setConsents(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCheckAll = () => {
    const newState = !allChecked;
    setConsents({
      ageConfirmation: newState,
      termsAccepted: newState,
      privacyAccepted: newState,
      marketingOptIn: newState
    });
  };

  const handleEnter = async () => {
    if (!canProceed) return;

    setIsSubmitting(true);

    try {
      // Initialize audio with user gesture
      const audioManager = AudioManager.getInstance();
      await audioManager.ensureInitialized();
      
      // Start playing menu music
      await audioManager.playTrack('menu', {
        volume: 0.6,
        loop: true,
        fadeInDuration: 2000
      });

      console.log('Legal consents collected:', consents);
      console.log('Audio initialized and menu music started');

      // Small delay for better UX
      setTimeout(() => {
        onComplete();
      }, 500);

    } catch (error) {
      console.error('Failed to initialize audio:', error);
      // Still proceed even if audio fails
      onComplete();
    }
  };

  return (
    <div className="legal-overlay">
      <div className="legal-overlay-backdrop" />
      
      <div className="legal-content">
        <div className="legal-header">
          <h1 className="legal-title neon-text neon-green">Welcome to SnakePit</h1>
          <p className="legal-subtitle neon-text neon-cyan">
            Before you enter the arena, we need your consent on a few things
          </p>
        </div>

        <div className="legal-form">
          {/* Check All Option */}
          <div className="consent-item check-all-item">
            <label className="consent-label">
              <input
                type="checkbox"
                className="consent-checkbox"
                checked={allChecked}
                onChange={handleCheckAll}
              />
              <span className="checkbox-custom"></span>
              <span className="consent-text neon-text neon-yellow">
                Check All (Recommended)
              </span>
            </label>
          </div>

          <div className="consent-divider"></div>

          {/* Required Consents */}
          <div className="consent-item required">
            <label className="consent-label">
              <input
                type="checkbox"
                className="consent-checkbox"
                checked={consents.ageConfirmation}
                onChange={() => handleConsentChange('ageConfirmation')}
              />
              <span className="checkbox-custom"></span>
              <span className="consent-text">
                I am 18 years or older
                <span className="required-indicator neon-text neon-pink"> *</span>
              </span>
            </label>
          </div>

          <div className="consent-item required">
            <label className="consent-label">
              <input
                type="checkbox"
                className="consent-checkbox"
                checked={consents.termsAccepted}
                onChange={() => handleConsentChange('termsAccepted')}
              />
              <span className="checkbox-custom"></span>
              <span className="consent-text">
                I have read and accept the{' '}
                <a href="#terms" className="legal-link neon-text neon-cyan">
                  Terms and Conditions
                </a>
                <span className="required-indicator neon-text neon-pink"> *</span>
              </span>
            </label>
          </div>

          <div className="consent-item required">
            <label className="consent-label">
              <input
                type="checkbox"
                className="consent-checkbox"
                checked={consents.privacyAccepted}
                onChange={() => handleConsentChange('privacyAccepted')}
              />
              <span className="checkbox-custom"></span>
              <span className="consent-text">
                I have read and accept the{' '}
                <a href="#privacy" className="legal-link neon-text neon-cyan">
                  Privacy Policy
                </a>
                <span className="required-indicator neon-text neon-pink"> *</span>
              </span>
            </label>
          </div>

          {/* Optional Consent */}
          <div className="consent-item optional">
            <label className="consent-label">
              <input
                type="checkbox"
                className="consent-checkbox"
                checked={consents.marketingOptIn}
                onChange={() => handleConsentChange('marketingOptIn')}
              />
              <span className="checkbox-custom"></span>
              <span className="consent-text">
                I would like to opt in to newsletter and marketing communications
                <span className="optional-indicator neon-text neon-green"> (Optional)</span>
              </span>
            </label>
          </div>
        </div>

        <div className="legal-footer">
          <p className="required-note neon-text neon-dim">
            <span className="neon-text neon-pink">*</span> Required fields
          </p>
          
          <button
            className={`enter-button neon-button ${canProceed ? 'neon-green' : 'disabled'}`}
            onClick={handleEnter}
            disabled={!canProceed || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Initializing...
              </>
            ) : (
              <>
                🎮 Enter SnakePit
              </>
            )}
          </button>

          {!canProceed && (
            <p className="error-message neon-text neon-orange">
              Please accept all required terms to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalOverlay;
