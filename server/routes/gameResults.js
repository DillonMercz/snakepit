const express = require('express');
const router = express.Router();

// Mock Supabase functions for now - replace with actual Supabase client
const mockSupabase = {
  async secureCashout(gameMode, wagerAmount, finalScore, finalLength, finalCash, durationSeconds, userId) {
    console.log('🎮 Server processing cashout:', {
      gameMode,
      wagerAmount,
      finalScore,
      finalLength,
      finalCash,
      durationSeconds,
      userId
    });

    // Validate parameters
    if (!gameMode || !['classic', 'warfare'].includes(gameMode)) {
      return { success: false, error: 'Invalid game mode' };
    }

    if (!wagerAmount || wagerAmount <= 0 || isNaN(wagerAmount)) {
      return { success: false, error: 'Invalid wager amount' };
    }

    if (finalScore < 0 || isNaN(finalScore)) {
      return { success: false, error: 'Invalid final score' };
    }

    if (finalLength < 0 || isNaN(finalLength)) {
      return { success: false, error: 'Invalid final length' };
    }

    if (finalCash < 0 || isNaN(finalCash)) {
      return { success: false, error: 'Invalid final cash' };
    }

    if (!durationSeconds || durationSeconds <= 0 || isNaN(durationSeconds)) {
      return { success: false, error: 'Invalid duration' };
    }

    if (!userId) {
      return { success: false, error: 'Invalid user ID' };
    }

    // Mock successful cashout
    const winnings = Math.max(0, finalCash - wagerAmount);
    
    return {
      success: true,
      winnings,
      finalBalance: finalCash,
      gameId: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  },

  async saveGameSession(gameData) {
    console.log('🎮 Server saving game session:', gameData);
    
    // Mock save operation
    return {
      success: true,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
};

/**
 * POST /api/game-results/cashout
 * Handle player cashout
 */
router.post('/cashout', async (req, res) => {
  try {
    const {
      gameMode,
      wagerAmount,
      finalScore,
      finalLength,
      finalCash,
      durationSeconds,
      userId,
      username
    } = req.body;

    console.log('🎮 Received cashout request:', {
      gameMode,
      wagerAmount,
      finalScore,
      finalLength,
      finalCash,
      durationSeconds,
      userId,
      username
    });

    // Server-side validation
    if (!userId || !username) {
      return res.status(400).json({
        success: false,
        error: 'Missing user information'
      });
    }

    if (!gameMode || !['classic', 'warfare'].includes(gameMode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid game mode'
      });
    }

    // Process cashout through Supabase
    const result = await mockSupabase.secureCashout(
      gameMode,
      wagerAmount,
      finalScore,
      finalLength,
      finalCash,
      durationSeconds,
      userId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Save game session data
    const sessionData = {
      userId,
      username,
      gameMode,
      wagerAmount,
      finalScore,
      finalLength,
      finalCash,
      durationSeconds,
      winnings: result.winnings,
      timestamp: new Date().toISOString()
    };

    const sessionResult = await mockSupabase.saveGameSession(sessionData);

    res.json({
      success: true,
      winnings: result.winnings,
      finalBalance: result.finalBalance,
      gameId: result.gameId,
      sessionId: sessionResult.sessionId
    });

  } catch (error) {
    console.error('🎮 Error processing cashout:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/game-results/save
 * Save game result without cashout
 */
router.post('/save', async (req, res) => {
  try {
    const {
      userId,
      username,
      gameMode,
      wagerAmount,
      finalScore,
      finalLength,
      finalCash,
      durationSeconds,
      cashedOut
    } = req.body;

    console.log('🎮 Received save game result request:', {
      userId,
      username,
      gameMode,
      finalScore,
      cashedOut
    });

    // Server-side validation
    if (!userId || !username || !gameMode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // Save game session
    const sessionData = {
      userId,
      username,
      gameMode,
      wagerAmount: wagerAmount || 0,
      finalScore: finalScore || 0,
      finalLength: finalLength || 0,
      finalCash: finalCash || 0,
      durationSeconds: durationSeconds || 0,
      cashedOut: cashedOut || false,
      timestamp: new Date().toISOString()
    };

    const result = await mockSupabase.saveGameSession(sessionData);

    res.json({
      success: true,
      sessionId: result.sessionId
    });

  } catch (error) {
    console.error('🎮 Error saving game result:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/game-results/start-wager
 * Start a game and deduct wager
 */
router.post('/start-wager', async (req, res) => {
  try {
    const { userId, gameMode, wagerAmount } = req.body;

    console.log('🎮 Received start wager request:', {
      userId,
      gameMode,
      wagerAmount
    });

    // Server-side validation
    if (!userId || !gameMode || !wagerAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    if (wagerAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wager amount'
      });
    }

    // Mock wager deduction - replace with actual Supabase logic
    console.log(`🎮 Deducting wager of ${wagerAmount} for user ${userId}`);

    res.json({
      success: true,
      wagerAmount,
      gameId: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

  } catch (error) {
    console.error('🎮 Error starting wager:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
