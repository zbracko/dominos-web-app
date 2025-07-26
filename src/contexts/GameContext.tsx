import React, { createContext, useContext, useEffect, ReactNode, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { GameState, Player, DominoTile, GameHistory, GameSettings, GameRoom } from '../types'
import { createDominoSet, shuffleArray, canPlayTile, getPlayablePositions, playTile, isRoundOver, getRoundWinner, getGameWinner, calculateRoundScoring, findStartingPlayer } from '../utils/gameUtils'
import GameHistoryService from '../utils/gameHistoryService'
import { useAuth } from './AuthContext'

interface GameContextType {
  gameState: GameState | null
  gameSettings: GameSettings | null
  isMultiplayerGame: boolean
  currentRoom: GameRoom | null
  hasSavedGame: boolean
  startNewGame: (settings: GameSettings) => void
  startMultiplayerGame: (room: GameRoom) => void
  makeMove: (tileId: string, position: 'left' | 'right') => void
  drawFromBoneyard: () => void
  resetGame: () => void
  updateSettings: (settings: Partial<GameSettings>) => void
  saveGame: () => void
  loadGame: () => boolean
  pauseGame: () => void
  resumeGame: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null)
  const [isMultiplayerGame, setIsMultiplayerGame] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null)
  const [hasSavedGame, setHasSavedGame] = useState(false)
  const { user, updateStats } = useAuth()

  // Helper functions for local storage
  const saveGameState = (gameData: any) => {
    if (user) {
      localStorage.setItem(`dominos_game_${user.id}`, JSON.stringify(gameData))
    }
  }

  const loadGameState = () => {
    if (user) {
      const savedData = localStorage.getItem(`dominos_game_${user.id}`)
      return savedData ? JSON.parse(savedData) : null
    }
    return null
  }

  // Check for saved games on mount and auth changes
  useEffect(() => {
    if (user) {
      const savedGame = loadGameState()
      setHasSavedGame(!!savedGame)
    } else {
      setHasSavedGame(false)
    }
  }, [user])

  // Auto-save game state when it changes
  useEffect(() => {
    if (gameState && gameState.gameStatus === 'playing' && user) {
      const gameData = {
        gameState,
        gameSettings,
        isMultiplayerGame,
        timestamp: Date.now()
      }
      saveGameState(gameData)
    }
  }, [gameState, gameSettings, isMultiplayerGame, user])

  const createComputerPlayers = (count: number): Player[] => {
    const computerNames = ['CPU Alex', 'CPU Maya', 'CPU Sam']
    return Array.from({ length: count }, (_, index) => ({
      id: `cpu-${index + 1}`,
      name: computerNames[index] || `CPU Player ${index + 1}`,
      hand: [],
      score: 0,
      isComputer: true,
      avatar: '🤖'
    }))
  }

  const dealTiles = (players: Player[], dominoSet: DominoTile[]): { updatedPlayers: Player[], remainingTiles: DominoTile[] } => {
    const tilesPerPlayer = players.length <= 2 ? 7 : 6
    
    const updatedPlayers = players.map((player, playerIndex) => ({
      ...player,
      hand: dominoSet.slice(playerIndex * tilesPerPlayer, (playerIndex + 1) * tilesPerPlayer)
    }))
    
    const totalTilesDealt = players.length * tilesPerPlayer
    
    return {
      updatedPlayers,
      remainingTiles: dominoSet.slice(totalTilesDealt)
    }
  }

  const startNewGame = (settings: GameSettings) => {
    if (!user) {
      toast.error('Please login to start a game')
      return
    }

    setGameSettings(settings)
    setIsMultiplayerGame(false)

    // Create players
    const players: Player[] = [
      {
        id: user.id,
        name: user.username,
        hand: [],
        score: 0,
        avatar: user.avatar || '👤'
      }
    ]

    // Add computer players
    if (settings.hasComputerPlayers) {
      const computerPlayers = createComputerPlayers(settings.computerCount || 1)
      players.push(...computerPlayers)
    }

    // Generate and shuffle domino set
    const dominoSet = shuffleArray(createDominoSet())
    
    // Deal tiles
    const { updatedPlayers, remainingTiles } = dealTiles(players, dominoSet)

    // Debug logging
    console.log('🎲 Game Started Debug Info:')
    console.log('Total domino set:', dominoSet.length, 'tiles')
    console.log('Players after dealing:', updatedPlayers.map(p => ({ 
      name: p.name, 
      handSize: p.hand.length,
      hand: p.hand.map(t => `${t.leftDots}-${t.rightDots}`)
    })))
    console.log('Remaining boneyard:', remainingTiles.length, 'tiles')

    // Create initial game state
    const newGameState: GameState = {
      players: updatedPlayers,
      currentPlayerIndex: 0,
      board: [],
      boneyard: remainingTiles,
      gameStatus: 'playing',
      targetScore: settings.targetScore,
      round: 1,
      winner: null
    }

    setGameState(newGameState)
    toast.success(`Game started! 🎲 You have ${updatedPlayers[0].hand.length} tiles`)
  }

  const startMultiplayerGame = (room: GameRoom) => {
    if (!user) {
      toast.error('Please login to join multiplayer games')
      return
    }

    console.log('🎮 Starting multiplayer game with room:', room)
    
    setGameSettings(room.gameSettings)
    setIsMultiplayerGame(true)
    setCurrentRoom(room)

    // Always initialize new game state for multiplayer games
    // Create players from room data
    const players: Player[] = room.players.map(roomPlayer => ({
      id: roomPlayer.id,
      name: roomPlayer.name,
      hand: [],
      score: 0,
      isComputer: false, // Multiplayer players are never computer players
      avatar: roomPlayer.avatar
    }))

    // Generate and shuffle domino set
    const dominoSet = shuffleArray(createDominoSet())
    
    // Deal tiles
    const { updatedPlayers, remainingTiles } = dealTiles(players, dominoSet)

    // Debug logging for multiplayer game
    console.log('🎲 Multiplayer Game Started:')
    console.log('Room ID:', room.id)
    console.log('Players:', updatedPlayers.map(p => ({ name: p.name, handSize: p.hand.length })))
    console.log('Boneyard size:', remainingTiles.length)

    // Create initial game state
    const newGameState: GameState = {
      players: updatedPlayers,
      currentPlayerIndex: 0,
      board: [],
      boneyard: remainingTiles,
      gameStatus: 'playing',
      targetScore: room.gameSettings.targetScore,
      round: 1,
      winner: null
    }

    setGameState(newGameState)
    toast.success(`🎮 ${room.players.length}-player game started!`)
  }

  const makeMove = (tileId: string, position: 'left' | 'right'): void => {
    if (!gameState || !gameSettings || gameState.gameStatus !== 'playing') return

    // Handle pass move (empty tileId)
    if (tileId === '') {
      const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length
      setGameState({
        ...gameState,
        currentPlayerIndex: nextPlayerIndex
      })
      return
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    const tileIndex = currentPlayer.hand.findIndex(t => t.id === tileId)
    if (tileIndex === -1) return

    const tile = currentPlayer.hand[tileIndex]
    
    // Validate the move using proper domino logic
    if (!canPlayTile(tile, gameState.board)) {
      toast.error('This tile cannot be played!')
      return
    }

    // Check if the position is valid for this tile
    const playablePositions = getPlayablePositions(tile, gameState.board)
    if (!playablePositions.includes(position)) {
      toast.error('Cannot place tile in that position!')
      return
    }

    // Use the proper game logic from gameUtils
    const newGameState = playTile(gameState, tileId, position)
    
    // Check for round end conditions
    if (isRoundOver(newGameState)) {
      const roundWinner = getRoundWinner(newGameState)
      if (roundWinner) {
        // Calculate round scoring (penalty points)
        const updatedPlayers = calculateRoundScoring(newGameState, roundWinner)
        
        // Check if game is over (someone reached target score)
        const gameWinner = getGameWinner({ ...newGameState, players: updatedPlayers })
        
        if (gameWinner) {
          // Game is completely over
          const finalGameState = {
            ...newGameState,
            players: updatedPlayers,
            gameStatus: 'finished' as const,
            winner: gameWinner
          }
          setGameState(finalGameState)
          handleGameEnd(gameWinner, updatedPlayers)
          return
        } else {
          // Start new round
          startNewRound({ ...newGameState, players: updatedPlayers })
          return
        }
      }
    }
    
    setGameState(newGameState)
  }

  const startNewRound = (gameState: GameState) => {
    if (!gameSettings) return
    
    toast.success(`Round ${gameState.round} complete! Starting new round...`)
    
    // Generate new domino set and deal tiles
    const dominoSet = shuffleArray(createDominoSet())
    const { updatedPlayers, remainingTiles } = dealTiles(gameState.players, dominoSet)
    
    // Find starting player for new round
    const startingPlayerIndex = findStartingPlayer(updatedPlayers)
    
    const newRoundState: GameState = {
      ...gameState,
      players: updatedPlayers,
      board: [],
      boneyard: remainingTiles,
      currentPlayerIndex: startingPlayerIndex,
      round: gameState.round + 1,
      gameStatus: 'playing'
    }
    
    setGameState(newRoundState)
  }

  const drawFromBoneyard = (): void => {
    if (!gameState || gameState.gameStatus !== 'playing' || gameState.boneyard.length === 0) return

    const playerId = gameState.players[gameState.currentPlayerIndex].id
    const playerIndex = gameState.players.findIndex(p => p.id === playerId)
    if (playerIndex === -1 || playerIndex !== gameState.currentPlayerIndex) return

    const drawnTile = gameState.boneyard[0]
    const updatedPlayers = [...gameState.players]
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      hand: [...updatedPlayers[playerIndex].hand, drawnTile]
    }

    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length

    setGameState({
      ...gameState,
      players: updatedPlayers,
      boneyard: gameState.boneyard.slice(1),
      currentPlayerIndex: nextPlayerIndex
    })
  }

  const handleGameEnd = (winner: Player, finalPlayers: Player[]) => {
    if (!user || !gameState || !gameSettings) return

    // Create game history
    const gameHistory: GameHistory = {
      id: `game-${Date.now()}`,
      players: finalPlayers,
      winner,
      moves: [], // You'd track moves during the game
      duration: Date.now() - (Date.now() - 300000), // Placeholder duration
      targetScore: gameState.targetScore,
      finalScores: finalPlayers.reduce((acc, player) => {
        acc[player.id] = player.score
        return acc
      }, {} as Record<string, number>),
      createdAt: new Date().toISOString(),
      gameSettings
    }

    // Save game history using singleton instance
    const gameHistoryService = new GameHistoryService()
    gameHistoryService.saveGameHistory(gameHistory)

    // Update user stats if current user won
    if (winner.id === user.id && user.stats) {
      const newStats = {
        ...user.stats,
        gamesPlayed: user.stats.gamesPlayed + 1,
        gamesWon: user.stats.gamesWon + 1,
        totalScore: user.stats.totalScore + winner.score,
        averageScore: (user.stats.totalScore + winner.score) / (user.stats.gamesPlayed + 1),
        bestScore: Math.max(user.stats.bestScore, winner.score),
        winRate: ((user.stats.gamesWon + 1) / (user.stats.gamesPlayed + 1)) * 100,
        winStreak: user.stats.winStreak + 1,
        totalPointsScored: user.stats.totalPointsScored + winner.score
      }
      updateStats(newStats)
    } else if (user.stats) {
      // Update stats for loss
      const userPlayer = finalPlayers.find(p => p.id === user.id)
      const userScore = userPlayer ? userPlayer.score : 0
      
      const newStats = {
        ...user.stats,
        gamesPlayed: user.stats.gamesPlayed + 1,
        totalScore: user.stats.totalScore + userScore,
        averageScore: (user.stats.totalScore + userScore) / (user.stats.gamesPlayed + 1),
        winRate: (user.stats.gamesWon / (user.stats.gamesPlayed + 1)) * 100,
        winStreak: 0,
        totalPointsScored: user.stats.totalPointsScored + userScore
      }
      updateStats(newStats)
    }

    // Clear saved game since it's finished
    clearSavedGame()
    
    toast.success(`Game finished! ${winner.name} wins! 🏆`)
  }

  const resetGame = () => {
    setGameState(null)
    setGameSettings(null)
    setIsMultiplayerGame(false)
    setCurrentRoom(null)
    clearSavedGame()
  }

  const saveGame = useCallback(() => {
    if (gameState && user) {
      try {
        const gameData = {
          gameState,
          gameSettings,
          timestamp: Date.now()
        }
        localStorage.setItem(`dominos_game_${user.id}`, JSON.stringify(gameData))
        setHasSavedGame(true)
        toast.success('Game saved! 💾')
      } catch (error) {
        console.error('Failed to save game:', error)
        toast.error('Failed to save game')
      }
    }
  }, [gameState, gameSettings, user])

  const loadGame = (): boolean => {
    if (!user) return false
    
    const savedGame = loadGameState()
    if (savedGame) {
      setGameState(savedGame.gameState)
      setGameSettings(savedGame.gameSettings)
      setIsMultiplayerGame(savedGame.isMultiplayerGame || false)
      setHasSavedGame(true)
      toast.success('Game loaded! 🎮')
      return true
    }
    return false
  }

  const clearSavedGame = () => {
    if (user) {
      localStorage.removeItem(`dominos_game_${user.id}`)
      setHasSavedGame(false)
    }
  }

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    if (gameSettings) {
      setGameSettings({ ...gameSettings, ...newSettings })
    }
  }

  const pauseGame = () => {
    if (gameState && gameState.gameStatus === 'playing') {
      setGameState({
        ...gameState,
        gameStatus: 'paused' as any
      })
      toast.success('Game paused ⏸️')
    }
  }

  const resumeGame = () => {
    if (gameState && (gameState.gameStatus as any) === 'paused') {
      setGameState({
        ...gameState,
        gameStatus: 'playing'
      })
      toast.success('Game resumed ▶️')
    }
  }

  const value: GameContextType = {
    gameState,
    gameSettings,
    isMultiplayerGame,
    currentRoom,
    hasSavedGame,
    startNewGame,
    startMultiplayerGame,
    makeMove,
    drawFromBoneyard,
    resetGame,
    updateSettings,
    saveGame,
    loadGame,
    pauseGame,
    resumeGame
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}