import { GameHistory, GameSession, PlayerSessionStats, GameHighlight, Achievement } from '../types'

class GameHistoryService {
  private static instance: GameHistoryService

  public static getInstance(): GameHistoryService {
    if (!GameHistoryService.instance) {
      GameHistoryService.instance = new GameHistoryService()
    }
    return GameHistoryService.instance
  }

  // Save a completed game to history
  public saveGameHistory(gameHistory: GameHistory): void {
    try {
      const savedGames = this.getAllGameHistory()
      savedGames.unshift(gameHistory) // Add to beginning
      
      // Keep only last 50 games to avoid localStorage bloat
      const trimmedGames = savedGames.slice(0, 50)
      localStorage.setItem('dominos_game_history', JSON.stringify(trimmedGames))
    } catch (error) {
      console.warn('Failed to save game history:', error)
    }
  }

  // Alias for saveGameHistory to match usage in GameContext
  public addGameHistory(gameHistory: GameHistory): void {
    this.saveGameHistory(gameHistory)
  }

  // Get all game history
  public getAllGameHistory(): GameHistory[] {
    try {
      const saved = localStorage.getItem('dominos_game_history')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.warn('Failed to load game history:', error)
      return []
    }
  }

  // Get games for specific user
  public getUserGameHistory(userId: string, limit = 20): GameHistory[] {
    const allGames = this.getAllGameHistory()
    return allGames
      .filter(game => game.players.some(p => p.id === userId))
      .slice(0, limit)
  }

  // Get detailed session stats for a game
  public generateSessionStats(gameHistory: GameHistory): GameSession {
    const playerStats: Record<string, PlayerSessionStats> = {}
    const highlights: GameHighlight[] = []

    // Initialize player stats
    gameHistory.players.forEach(player => {
      playerStats[player.id] = {
        playerId: player.id,
        tilesPlayed: 0,
        averageMoveTime: 0,
        blockedTurns: 0,
        doublesPlayed: 0,
        highestScoringTile: 0,
        boneyardDraws: 0
      }
    })

    // Analyze moves
    let previousTimestamp = 0
    gameHistory.moves.forEach((move, index) => {
      const stats = playerStats[move.playerId]
      if (!stats) return

      stats.tilesPlayed++
      
      // Calculate move time
      if (previousTimestamp > 0) {
        const moveTime = move.timestamp - previousTimestamp
        stats.averageMoveTime = (stats.averageMoveTime * (stats.tilesPlayed - 1) + moveTime) / stats.tilesPlayed
      }
      previousTimestamp = move.timestamp

      // Track doubles
      if (move.tile.isDouble) {
        stats.doublesPlayed++
      }

      // Track highest scoring tile
      const tileScore = move.tile.leftDots + move.tile.rightDots
      if (tileScore > stats.highestScoringTile) {
        stats.highestScoringTile = tileScore
      }

      // Detect highlights
      if (move.tile.isDouble && move.tile.leftDots === 6 && index === 0) {
        highlights.push({
          type: 'double_six_start',
          playerId: move.playerId,
          description: 'Started the game with double-six!',
          timestamp: move.timestamp
        })
      }
    })

    return {
      id: gameHistory.id,
      gameHistory,
      playerStats,
      highlights
    }
  }

  // Check and unlock achievements
  public checkAchievements(userId: string, userStats: any): Achievement[] {
    const newAchievements: Achievement[] = []
    const existingAchievements = this.getUserAchievements(userId)
    const existingIds = new Set(existingAchievements.map(a => a.id))

    const achievementDefinitions = [
      {
        id: 'first_win',
        title: 'First Victory',
        description: 'Win your first game',
        icon: '🏆',
        category: 'wins' as const,
        requirement: 1,
        checkCondition: () => userStats.gamesWon >= 1
      },
      {
        id: 'winning_streak_5',
        title: 'Hot Streak',
        description: 'Win 5 games in a row',
        icon: '🔥',
        category: 'streak' as const,
        requirement: 5,
        checkCondition: () => userStats.winStreak >= 5
      },
      {
        id: 'century_club',
        title: 'Century Club',
        description: 'Play 100 games',
        icon: '💯',
        category: 'games' as const,
        requirement: 100,
        checkCondition: () => userStats.gamesPlayed >= 100
      },
      {
        id: 'domino_master',
        title: 'Domino Master',
        description: 'Achieve 75% win rate (min 20 games)',
        icon: '👑',
        category: 'wins' as const,
        requirement: 75,
        checkCondition: () => userStats.gamesPlayed >= 20 && userStats.winRate >= 75
      },
      {
        id: 'perfect_ten',
        title: 'Perfect Ten',
        description: 'Win 10 games',
        icon: '⭐',
        category: 'wins' as const,
        requirement: 10,
        checkCondition: () => userStats.gamesWon >= 10
      },
      {
        id: 'marathon_player',
        title: 'Marathon Player',
        description: 'Play 50 games',
        icon: '🏃',
        category: 'games' as const,
        requirement: 50,
        checkCondition: () => userStats.gamesPlayed >= 50
      }
    ]

    achievementDefinitions.forEach(def => {
      if (!existingIds.has(def.id) && def.checkCondition()) {
        const achievement: Achievement = {
          id: def.id,
          title: def.title,
          description: def.description,
          icon: def.icon,
          category: def.category,
          requirement: def.requirement,
          progress: def.requirement,
          unlockedAt: new Date().toISOString()
        }
        newAchievements.push(achievement)
      }
    })

    // Save new achievements
    if (newAchievements.length > 0) {
      const allAchievements = [...existingAchievements, ...newAchievements]
      this.saveUserAchievements(userId, allAchievements)
    }

    return newAchievements
  }

  private getUserAchievements(userId: string): Achievement[] {
    try {
      const saved = localStorage.getItem(`dominos_achievements_${userId}`)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      return []
    }
  }

  private saveUserAchievements(userId: string, achievements: Achievement[]): void {
    try {
      localStorage.setItem(`dominos_achievements_${userId}`, JSON.stringify(achievements))
    } catch (error) {
      console.warn('Failed to save achievements:', error)
    }
  }

  // Get game statistics for charts/analysis
  public getGameAnalytics(userId: string) {
    const userGames = this.getUserGameHistory(userId, 30) // Last 30 games
    
    const analytics = {
      winsByTargetScore: { 200: 0, 300: 0, 400: 0, 500: 0 } as Record<200 | 300 | 400 | 500, number>,
      averageGameDuration: 0,
      favoriteOpponents: {} as Record<string, number>,
      recentPerformance: [] as { date: string, won: boolean }[],
      totalPlayTime: 0
    }

    userGames.forEach(game => {
      const userWon = game.winner.id === userId
      
      // Wins by target score
      if (userWon) {
        analytics.winsByTargetScore[game.targetScore as 200 | 300 | 400 | 500]++
      }

      // Game duration
      analytics.totalPlayTime += game.duration

      // Opponents
      game.players.forEach(player => {
        if (player.id !== userId && !player.isComputer) {
          analytics.favoriteOpponents[player.name] = (analytics.favoriteOpponents[player.name] || 0) + 1
        }
      })

      // Recent performance (last 10 games)
      analytics.recentPerformance.push({
        date: new Date(game.createdAt).toLocaleDateString(),
        won: userWon
      })
    })

    analytics.averageGameDuration = userGames.length > 0 ? analytics.totalPlayTime / userGames.length : 0
    analytics.recentPerformance = analytics.recentPerformance.slice(0, 10)

    return analytics
  }
}

export default GameHistoryService