// Server API-based game stats service - no direct Supabase calls

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3005';

export interface GameResult {
  userId: string
  username: string
  gameMode: 'classic' | 'warfare'
  wagerAmount: number
  finalScore: number
  finalLength: number
  finalCash: number
  durationSeconds: number
  cashedOut: boolean
}

export class GameStatsService {
  // Secure function to start a game and deduct wager
  static async startGame(gameMode: 'classic' | 'warfare', wagerAmount: number, userId?: string) {
    try {
      console.log('🎮 Starting secure game via server API:', { gameMode, wagerAmount });

      const response = await fetch(`${SERVER_URL}/api/game-results/start-wager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameMode,
          wagerAmount,
          userId: userId || 'temp-user-id', // TODO: Get from auth context
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error starting game wager:', error);
      return { success: false, error: 'Failed to start game wager' };
    }
  }

  // Secure function to process cashout
  static async processCashout(
    gameMode: 'classic' | 'warfare',
    wagerAmount: number,
    finalScore: number,
    finalLength: number,
    finalCash: number,
    durationSeconds: number,
    userId: string,
    username: string
  ) {
    try {
      console.log('🎮 Processing secure cashout via server API', {
        gameMode,
        wagerAmount,
        finalScore,
        finalLength,
        finalCash,
        durationSeconds,
        userId,
        username
      });

      const response = await fetch(`${SERVER_URL}/api/game-results/cashout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameMode,
          wagerAmount,
          finalScore,
          finalLength,
          finalCash,
          durationSeconds,
          userId,
          username
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('🎮 Cashout successful:', result);
        // Trigger a profile refresh to update the UI
        window.dispatchEvent(new CustomEvent('profileRefresh'));
      } else {
        console.error('🎮 Cashout failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error processing cashout:', error);
      return { success: false, error: 'Failed to process cashout' };
    }
  }

  // Save game result using server API
  static async saveGameResult(result: GameResult): Promise<boolean> {
    try {
      console.log('🎮 Saving game result via server API');

      const response = await fetch(`${SERVER_URL}/api/game-results/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });

      const apiResult = await response.json();

      if (!apiResult.success) {
        console.error('Server API failed to save game result:', apiResult.error);
        return false;
      }

      console.log('🎮 Game result saved successfully via server API');

      // Trigger a profile refresh to update the UI
      window.dispatchEvent(new CustomEvent('profileRefresh'));

      return true;
    } catch (error) {
      console.error('Error saving game result:', error);
      return false;
    }
  }

  static async recordCashout(userId: string, username: string, gameMode: 'classic' | 'warfare', cashoutAmount: number): Promise<boolean> {
    try {
      console.log('🎮 Recording cashout via server API');

      const response = await fetch(`${SERVER_URL}/api/game-results/cashout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          username,
          gameMode,
          wagerAmount: 50, // Default wager
          finalScore: cashoutAmount,
          finalLength: 0,
          finalCash: cashoutAmount,
          durationSeconds: 1, // Minimal duration for cashout
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Cashout recorded successfully');
        return true;
      } else {
        console.error('Failed to record cashout:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error recording cashout:', error);
      return false;
    }
  }

  static calculateGameDuration(startTime: number): number {
    return Math.floor((Date.now() - startTime) / 1000)
  }

  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  static formatScore(score: number): string {
    return score.toLocaleString()
  }

  static formatCash(cash: number): string {
    return `$${cash.toLocaleString()}`
  }
}
