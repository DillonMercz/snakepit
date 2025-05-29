import { saveGameSession, updateLeaderboard, addTransaction, updateUserProfile, startGameWager, secureCashout } from '../lib/supabase'

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
  static async startGame(gameMode: 'classic' | 'warfare', wagerAmount: number) {
    console.log('🎮 Starting secure game:', { gameMode, wagerAmount })
    return await startGameWager(gameMode, wagerAmount)
  }

  // Secure function to process cashout
  static async processCashout(
    gameMode: 'classic' | 'warfare',
    wagerAmount: number,
    finalScore: number,
    finalLength: number,
    finalCash: number,
    durationSeconds: number
  ) {
    console.log('🎮 Processing secure cashout via GameStatsService', {
      gameMode,
      wagerAmount,
      finalScore,
      finalLength,
      finalCash,
      durationSeconds
    })

    const result = await secureCashout(gameMode, wagerAmount, finalScore, finalLength, finalCash, durationSeconds)

    if (result.success) {
      console.log('🎮 Cashout successful:', result)
      // Trigger a profile refresh to update the UI
      window.dispatchEvent(new CustomEvent('profileRefresh'))
    } else {
      console.error('🎮 Cashout failed:', result.error)
    }

    return result
  }

  // Legacy function - now uses secure cashout
  static async saveGameResult(result: GameResult): Promise<boolean> {
    try {
      console.log('🎮 Saving game result using secure cashout')

      // Use the secure cashout function instead of manual database operations
      const cashoutResult = await secureCashout(
        result.gameMode,
        result.wagerAmount,
        result.finalScore,
        result.finalLength,
        result.finalCash,
        result.durationSeconds
      )

      if (!cashoutResult.success) {
        console.error('Secure cashout failed:', cashoutResult.error)
        return false
      }

      console.log('Game result saved successfully via secure cashout')
      return true
    } catch (error) {
      console.error('Error saving game result:', error)
      return false
    }
  }

  static async recordCashout(userId: string, username: string, gameMode: 'classic' | 'warfare', cashoutAmount: number): Promise<boolean> {
    try {
      // Record cashout transaction
      await addTransaction({
        user_id: userId,
        type: 'cashout',
        amount: cashoutAmount,
        description: `${gameMode} mode in-game cashout`
      })

      console.log('Cashout recorded successfully')
      return true
    } catch (error) {
      console.error('Error recording cashout:', error)
      return false
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
