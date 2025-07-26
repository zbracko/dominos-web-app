import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Home, RotateCcw, Crown, AlertCircle, MessageCircle, Volume2, VolumeX } from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { useAuth } from '../contexts/AuthContext'
import { canPlayTile, getPlayablePosition } from '../utils/gameUtils'
import { DominoTile as DominoTileType, Player } from '../types'
import SmackTalkService from '../utils/smackTalkService'
import MultiplayerService from '../utils/multiplayerService'
import FirebaseMultiplayerService from '../utils/firebaseMultiplayerService'
import DominoTile from '../components/DominoTile'
import SnakeDominoBoard from '../components/SnakeDominoBoard'
import toast from 'react-hot-toast'

const GamePage: React.FC = () => {
  const { gameState, gameSettings, makeMove, drawFromBoneyard, resetGame, startMultiplayerGame } = useGame()
  const { user, updateStats } = useAuth()
  const navigate = useNavigate()
  const [selectedTile, setSelectedTile] = useState<string | null>(null)
  const [showEndGame, setShowEndGame] = useState(false)
  const [smackTalkEnabled, setSmackTalkEnabled] = useState(true)
  const [currentSmackTalk, setCurrentSmackTalk] = useState<string | null>(null)
  const [showSmackTalk, setShowSmackTalk] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  const smackTalkService = SmackTalkService.getInstance()

  // Check for multiplayer game initialization
  useEffect(() => {
    const initializeMultiplayerGame = async () => {
      if (gameState) {
        // Game already exists, no need to initialize
        setIsInitializing(false)
        return
      }

      // Check if we should initialize a multiplayer game
      if (!gameState) {
        const localMultiplayerService = MultiplayerService.getInstance()
        const firebaseMultiplayerService = FirebaseMultiplayerService.getInstance()
        
        // Check local service first
        let currentRoom = localMultiplayerService.getCurrentRoom()
        
        // If no local room, check Firebase service
        if (!currentRoom) {
          currentRoom = firebaseMultiplayerService.getCurrentRoom()
        }
        
        if (currentRoom && currentRoom.status === 'playing') {
          // Initialize multiplayer game from room data
          console.log('Initializing multiplayer game from room:', currentRoom)
          startMultiplayerGame(currentRoom)
          toast.success(`Multiplayer game started!`, { icon: '🎮' })
        } else {
          // No active multiplayer game, redirect to home
          console.log('No active game or room found, redirecting to home')
          navigate('/')
        }
      }
      setIsInitializing(false)
    }

    if (isInitializing) {
      initializeMultiplayerGame()
    }
  }, [gameState, startMultiplayerGame, navigate, isInitializing])

  useEffect(() => {
    if (!gameState) {
      navigate('/')
      return
    }

    if (gameState.gameStatus === 'finished') {
      setShowEndGame(true)
      if (gameState.winner) {
        triggerSmackTalk('game_end', gameState.winner.name)
      }
    }
  }, [gameState, navigate])

  useEffect(() => {
    // Handle computer player turns
    if (gameState && gameState.gameStatus === 'playing') {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex]
      
      if (currentPlayer.isComputer) {
        const timer = setTimeout(() => {
          handleComputerMove(currentPlayer.id)
        }, 1500) // Delay for realistic computer thinking time

        return () => clearTimeout(timer)
      }
    }
  }, [gameState?.currentPlayerIndex, gameState?.gameStatus])

  // Trigger game start smack talk
  useEffect(() => {
    if (gameState && gameState.gameStatus === 'playing' && gameState.board.length === 0) {
      const timer = setTimeout(() => {
        triggerSmackTalk('game_start', 'Game Master')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameState?.gameStatus])

  const triggerSmackTalk = async (action: string, playerName: string) => {
    if (!smackTalkEnabled) return

    try {
      const context = {
        playerName,
        action: action as any,
        gameState: gameState ? {
          playerScore: gameState.players.find(p => p.name === playerName)?.score || 0,
          opponentScore: gameState.players.find(p => p.name !== playerName)?.score || 0,
          tilesLeft: gameState.players.find(p => p.name === playerName)?.hand.length || 0,
          isWinning: (gameState.players.find(p => p.name === playerName)?.score || 0) < 
                   (gameState.players.find(p => p.name !== playerName)?.score || 0)
        } : undefined
      }

      const message = await smackTalkService.generateSmackTalk(context)
      setCurrentSmackTalk(message)
      setShowSmackTalk(true)

      // Auto-hide after 4 seconds
      setTimeout(() => {
        setShowSmackTalk(false)
      }, 4000)

      // Also show as toast for important actions
      if (['good_move', 'winning', 'game_end'].includes(action)) {
        toast(message, { icon: '💬', duration: 3000 })
      }
    } catch (error) {
      console.warn('Failed to generate smack talk:', error)
    }
  }

  const handleComputerMove = (playerId: string) => {
    if (!gameState || !gameSettings) return

    const player = gameState.players.find(p => p.id === playerId)
    if (!player) return

    // Find playable tiles using proper domino logic
    const playableTiles = player.hand.filter(tile => canPlayTile(tile, gameState.board))
    
    if (playableTiles.length > 0) {
      // Improved AI based on difficulty
      let selectedTile: DominoTileType
      
      if (gameSettings.difficulty === 'easy') {
        // Easy: Random playable tile
        selectedTile = playableTiles[Math.floor(Math.random() * playableTiles.length)]
      } else if (gameSettings.difficulty === 'medium') {
        // Medium: Play tile with highest pip count
        selectedTile = playableTiles.reduce((best, tile) => 
          (tile.leftDots + tile.rightDots) > (best.leftDots + best.rightDots) ? tile : best
        )
      } else {
        // Hard: Strategic play - prefer doubles and high-value tiles
        const doubles = playableTiles.filter(tile => tile.isDouble)
        if (doubles.length > 0) {
          selectedTile = doubles.reduce((best, tile) => 
            (tile.leftDots + tile.rightDots) > (best.leftDots + best.rightDots) ? tile : best
          )
        } else {
          selectedTile = playableTiles.reduce((best, tile) => 
            (tile.leftDots + tile.rightDots) > (best.leftDots + best.rightDots) ? tile : best
          )
        }
      }
      
      // Get valid positions for this tile
      const validPosition = getPlayablePosition(selectedTile, gameState.board)
      const position = validPosition || 'left'
      
      makeMove(selectedTile.id, position)
      toast.success(`${player.name} played a tile`)
      
      // Trigger smack talk for computer move
      const moveQuality = (selectedTile.leftDots + selectedTile.rightDots) > 8 ? 'good_move' : 'bad_move'
      triggerSmackTalk(moveQuality, player.name)
    } else if (gameState.boneyard.length > 0) {
      // Draw from boneyard if no playable tiles
      drawFromBoneyard()
      toast(`${player.name} drew from boneyard`, { icon: 'ℹ️' })
      triggerSmackTalk('draw_tile', player.name)
      
      // After drawing, check if the computer can now play or needs to pass
      setTimeout(() => {
        if (gameState) {
          const updatedPlayer = gameState.players[gameState.currentPlayerIndex]
          const canPlay = updatedPlayer.hand.some(tile => canPlayTile(tile, gameState.board))
          
          if (!canPlay) {
            // Still can't play after drawing, advance to next player
            makeMove('', 'left') // Pass turn
            toast(`${player.name} passed their turn`, { icon: '⚠️' })
            triggerSmackTalk('blocked', player.name)
          }
          // If they can play, the useEffect will trigger another computer move
        }
      }, 500) // Small delay to ensure state is updated
    } else {
      // Pass turn if no moves available and no tiles to draw
      makeMove('', 'left') // Empty tileId signals a pass
      toast(`${player.name} passed their turn`, { icon: '⚠️' })
      triggerSmackTalk('blocked', player.name)
    }
  }

  const handleTileClick = (tileId: string) => {
    if (!gameState || gameState.gameStatus !== 'playing') return

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (currentPlayer.id !== user?.id) return

    const tile = currentPlayer.hand.find(t => t.id === tileId)
    if (!tile) return

    // For first move (empty board), allow any tile to be selected
    if (gameState.board.length === 0) {
      setSelectedTile(tileId)
      return
    }

    // For subsequent moves, check if tile can be played
    if (!canPlayTile(tile, gameState.board)) {
      toast.error('This tile cannot be played!')
      triggerSmackTalk('bad_move', currentPlayer.name)
      return
    }

    setSelectedTile(tileId)
  }

  const handlePositionClick = (position: 'left' | 'right') => {
    if (!selectedTile || !gameState) return

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    const tile = currentPlayer.hand.find(t => t.id === selectedTile)
    
    makeMove(selectedTile, position)
    setSelectedTile(null)

    // Trigger smack talk for user move
    if (tile) {
      const moveQuality = (tile.leftDots + tile.rightDots) > 8 ? 'good_move' : 'bad_move'
      triggerSmackTalk(moveQuality, currentPlayer.name)
    }
  }

  const handleDrawTile = () => {
    if (!gameState || gameState.boneyard.length === 0) {
      toast.error('No tiles left in boneyard!')
      return
    }

    drawFromBoneyard()
    toast('Drew a tile from boneyard', { icon: 'ℹ️' })
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    triggerSmackTalk('draw_tile', currentPlayer.name)
  }

  const handleNewGame = () => {
    resetGame()
    setShowEndGame(false)
    navigate('/settings')
  }

  // Calculate final stats when game ends
  useEffect(() => {
    if (gameState?.gameStatus === 'finished' && gameState.winner && user) {
      const calculateScore = (player: Player) => {
        return player.hand.reduce((sum, tile) => sum + tile.leftDots + tile.rightDots, 0)
      }
      
      if (gameState.winner.id === user.id) {
        updateStats({
          ...user.stats,
          gamesPlayed: user.stats.gamesPlayed + 1,
          gamesWon: user.stats.gamesWon + 1,
          totalScore: user.stats.totalScore + calculateScore(gameState.winner)
        })
      } else if (gameState.players && gameState.players.length > 0) {
        const humanPlayer = gameState.players.find(p => p.id === 'human') || gameState.players[0]
        updateStats({
          ...user.stats,
          gamesPlayed: user.stats.gamesPlayed + 1,
          totalScore: user.stats.totalScore + calculateScore(humanPlayer)
        })
      }
    }
  }, [gameState?.gameStatus, gameState?.winner, user, updateStats])

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p>No game in progress</p>
          <Link to="/" className="game-button mt-4 inline-block">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const isUserTurn = currentPlayer.id === user?.id
  const userPlayer = gameState.players.find(p => p.id === user?.id)

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Smack Talk Overlay */}
      <AnimatePresence>
        {showSmackTalk && currentSmackTalk && (
          <motion.div
            className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 max-w-xs mx-4"
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-xl backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-yellow-300" />
                <p className="font-medium text-xs">{currentSmackTalk}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="p-3 flex items-center justify-between bg-domino-800/50 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Dominos Game</h1>
            <p className="text-xs text-domino-300">
              Target: {gameState.targetScore} points
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSmackTalkEnabled(!smackTalkEnabled)}
            className={`p-2 transition-colors rounded-full hover:bg-white/10 ${
              smackTalkEnabled ? 'text-yellow-400' : 'text-gray-500'
            }`}
            title={smackTalkEnabled ? 'Disable Smack Talk' : 'Enable Smack Talk'}
          >
            {smackTalkEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={handleNewGame}
            className="p-2 text-white hover:text-green-300 transition-colors rounded-full hover:bg-white/10"
          >
            <RotateCcw size={16} />
          </button>
          <Link
            to="/"
            className="p-2 text-white hover:text-red-300 transition-colors rounded-full hover:bg-white/10"
          >
            <Home size={16} />
          </Link>
        </div>
      </header>

      {/* Game Board */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Current Player Indicator */}
        <motion.div
          className="p-2 bg-white/10 rounded-lg backdrop-blur-sm mx-3 mt-2 flex-shrink-0"
          key={currentPlayer.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 text-white">
            <span className="text-xl">{currentPlayer.avatar}</span>
            <span className="font-semibold text-sm">
              {isUserTurn ? "Your turn!" : `${currentPlayer.name}'s turn`}
            </span>
            {currentPlayer.isComputer && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
              />
            )}
          </div>
        </motion.div>

        {/* Players Info */}
        <div className="grid grid-cols-2 gap-2 mx-3 mt-2 flex-shrink-0">
          {gameState.players.map((player, index) => (
            <motion.div
              key={player.id}
              className={`p-2 rounded-lg backdrop-blur-sm ${
                index === gameState.currentPlayerIndex
                  ? 'bg-blue-500/20 border border-blue-400/50'
                  : 'bg-white/10'
              }`}
              layout
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{player.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-xs truncate">{player.name}</p>
                  <p className="text-domino-300 text-xs">
                    {player.hand.length} tiles • {player.score} pts
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Game Board - Domino Line */}
        <div className="flex-1 flex items-center justify-center min-h-0 px-2">
          <div className="w-full h-full flex items-center justify-center">
            {gameState.board.length === 0 ? (
              <div className="text-center text-domino-400">
                {selectedTile ? (
                  <motion.button
                    onClick={() => handlePositionClick('left')}
                    className="p-4 border-2 border-green-400 border-dashed rounded-lg bg-green-400/10 hover:bg-green-400/20 transition-colors"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <p className="text-base mb-1 text-green-400">🎯</p>
                    <p className="text-green-300 font-semibold text-xs">Click here to place your tile!</p>
                  </motion.button>
                ) : (
                  <>
                    <p className="text-base mb-1">🎯</p>
                    <p className="text-xs">Select a tile from your hand to start!</p>
                  </>
                )}
              </div>
            ) : (
              <SnakeDominoBoard 
                tiles={gameState.board}
                selectedTile={selectedTile}
                selectedTileData={selectedTile ? (userPlayer?.hand.find(t => t.id === selectedTile) || null) : null}
                onPositionClick={handlePositionClick}
              />
            )}
          </div>
        </div>

        {/* User's Hand */}
        {userPlayer && (
          <motion.div
            className="player-hand mx-3 mb-3 flex-shrink-0"
            layout
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
                <span className="text-base">🎲</span>
                Your Hand ({userPlayer.hand.length})
              </h3>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                {gameState.boneyard.length > 0 && isUserTurn && (
                  <button
                    onClick={handleDrawTile}
                    className="px-2 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                  >
                    Draw ({gameState.boneyard.length})
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto">
              {userPlayer.hand.map((tile) => {
                const isPlayable = canPlayTile(tile, gameState.board)
                const isSelected = selectedTile === tile.id
                
                return (
                  <DominoTile
                    key={tile.id}
                    tile={tile}
                    onClick={() => handleTileClick(tile.id)}
                    isPlayable={isPlayable && isUserTurn}
                    isSelected={isSelected}
                    size="medium"
                  />
                )
              })}
            </div>
          </motion.div>
        )}
      </main>

      {/* End Game Modal */}
      <AnimatePresence>
        {showEndGame && gameState.winner && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 2 }}
              >
                {gameState.winner.id === user?.id ? '🎉' : '🎯'}
              </motion.div>
              
              <h2 className="text-2xl font-bold text-domino-800 mb-2">
                {gameState.winner.id === user?.id ? 'You Won!' : 'Game Over'}
              </h2>
              
              <p className="text-domino-600 mb-6">
                <Crown className="inline w-5 h-5 mr-2" />
                {gameState.winner.name} is the winner!
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleNewGame}
                  className="w-full game-button"
                >
                  New Game
                </button>
                <Link
                  to="/"
                  className="block w-full py-3 bg-domino-600 hover:bg-domino-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GamePage