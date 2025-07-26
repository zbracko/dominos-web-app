import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Share2, Copy, Crown, UserCheck, UserX, Play, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import MultiplayerService from '../utils/multiplayerService'
import FirebaseMultiplayerService from '../utils/firebaseMultiplayerService'
import { GameRoom, GameSettings } from '../types'
import toast from 'react-hot-toast'

const MultiplayerPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null)
  const [roomCode, setRoomCode] = useState('')
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [useFirebase, setUseFirebase] = useState(true) // Default to Firebase for online play
  const [isConnecting, setIsConnecting] = useState(false)
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    playerCount: 2,
    targetScore: 300,
    hasComputerPlayers: false,
    computerCount: 0,
    difficulty: 'medium'
  })

  // Get the appropriate multiplayer service
  const getMultiplayerService = () => {
    return useFirebase ? FirebaseMultiplayerService.getInstance() : MultiplayerService.getInstance()
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const multiplayerService = getMultiplayerService()

    // Check if already in a room
    const existingRoom = multiplayerService.getCurrentRoom()
    if (existingRoom) {
      setCurrentRoom(existingRoom)
    }

    // Listen for room events
    const handlePlayerJoined = (data: any) => {
      setCurrentRoom(multiplayerService.getCurrentRoom())
      toast.success(`${data.player.name} joined!`)
    }

    const handlePlayerLeft = () => {
      setCurrentRoom(multiplayerService.getCurrentRoom())
      toast(`Player left the room`, { icon: '👋' })
    }

    const handleGameStarted = () => {
      navigate('/game') // Fixed: navigate to /game instead of /multiplayer-game
    }

    const handleRoomUpdated = (data: any) => {
      setCurrentRoom(data.room)
    }

    multiplayerService.on('player_joined', handlePlayerJoined)
    multiplayerService.on('player_left', handlePlayerLeft)
    multiplayerService.on('game_started', handleGameStarted)
    multiplayerService.on('room_updated', handleRoomUpdated)

    return () => {
      multiplayerService.off('player_joined', handlePlayerJoined)
      multiplayerService.off('player_left', handlePlayerLeft)
      multiplayerService.off('game_started', handleGameStarted)
      multiplayerService.off('room_updated', handleRoomUpdated)
    }
  }, [isAuthenticated, navigate, useFirebase])

  const handleCreateRoom = async () => {
    if (!user) return

    setIsConnecting(true)
    try {
      const multiplayerService = getMultiplayerService()
      const room = await multiplayerService.createRoom(user, gameSettings)
      setCurrentRoom(room)
      setShowCreateRoom(false)
    } catch (error) {
      console.error('Failed to create room:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!user || !roomCode.trim()) {
      toast.error('Please enter a room code')
      return
    }

    const trimmedCode = roomCode.toUpperCase().trim()
    setIsConnecting(true)

    try {
      const multiplayerService = getMultiplayerService()
      
      // First check if room exists
      const roomExists = await multiplayerService.roomExists(trimmedCode)
      if (!roomExists) {
        toast.error(`Room "${trimmedCode}" not found! Double-check the code.`)
        return
      }

      // Get room info first
      const roomInfo = await multiplayerService.getRoomInfo(trimmedCode)
      if (roomInfo) {
        console.log('Found room info:', roomInfo)
        toast(`Found room hosted by ${roomInfo.hostName}`, { icon: '🎯' })
      }

      const room = await multiplayerService.joinRoom(trimmedCode, user)
      if (room) {
        setCurrentRoom(room)
        setRoomCode('')
      }
    } catch (error) {
      console.error('Failed to join room:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleLeaveRoom = async () => {
    if (!user || !currentRoom) return

    const multiplayerService = getMultiplayerService()
    await multiplayerService.leaveRoom(user.id)
    setCurrentRoom(null)
    toast('Left the room', { icon: '👋' })
  }

  const handleToggleReady = async () => {
    if (!user) return

    const multiplayerService = getMultiplayerService()
    await multiplayerService.toggleReady(user.id)
    // Room will be updated via real-time listener
  }

  const handleStartGame = async () => {
    const multiplayerService = getMultiplayerService()
    if (!multiplayerService.canStartGame()) {
      toast.error('Not all players are ready!')
      return
    }

    await multiplayerService.startGame()
  }

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.id)
      toast.success('Room code copied!')
    }
  }

  const shareRoom = () => {
    if (currentRoom) {
      const shareText = `Join my Dominos game! Room code: ${currentRoom.id}`
      if (navigator.share) {
        navigator.share({
          title: 'Join my Dominos game!',
          text: shareText,
          url: window.location.origin
        })
      } else {
        navigator.clipboard.writeText(shareText)
        toast.success('Invite link copied!')
      }
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-4 flex items-center">
          <Link to="/" className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="ml-4 text-xl font-bold text-white">Multiplayer</h1>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div className="glass-card p-8 text-center max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
            <p className="text-domino-300 mb-6">Sign in to play with friends online.</p>
            <Link to="/login" className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              Login to Play
            </Link>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <header className="p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center">
          <Link to="/" className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="ml-4 text-xl font-bold text-white">Play with Friends</h1>
        </div>

        {/* Online/Local Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseFirebase(!useFirebase)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs transition-colors ${
              useFirebase 
                ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                : 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
            }`}
          >
            {useFirebase ? <Wifi size={12} /> : <WifiOff size={12} />}
            {useFirebase ? 'Online' : 'Local'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <motion.div className="max-w-md mx-auto space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Connection Status */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 justify-center">
              {useFirebase ? (
                <>
                  <Wifi className="text-green-400" size={16} />
                  <span className="text-green-300 text-sm font-medium">Online Mode</span>
                  <span className="text-domino-300 text-xs">- Play with friends anywhere!</span>
                </>
              ) : (
                <>
                  <WifiOff className="text-orange-400" size={16} />
                  <span className="text-orange-300 text-sm font-medium">Local Mode</span>
                  <span className="text-domino-300 text-xs">- Same device only</span>
                </>
              )}
            </div>
          </div>

          {!currentRoom ? (
            <>
              {/* Create Room */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="text-blue-400" size={24} />
                  Host a Game
                </h2>
                
                {!showCreateRoom ? (
                  <motion.button
                    onClick={() => setShowCreateRoom(true)}
                    className="w-full game-button"
                    whileTap={{ scale: 0.98 }}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Creating...' : 'Create Room'}
                  </motion.button>
                ) : (
                  <div className="space-y-4">
                    {/* Quick Settings */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Players</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[2, 3, 4].map((count) => (
                            <motion.button
                              key={count}
                              onClick={() => setGameSettings(prev => ({ ...prev, playerCount: count as 2 | 3 | 4 }))}
                              className={`p-2 rounded border-2 transition-all ${
                                gameSettings.playerCount === count
                                  ? 'border-blue-400 bg-blue-400/20 text-white'
                                  : 'border-white/20 bg-white/5 text-domino-300'
                              }`}
                              whileTap={{ scale: 0.95 }}
                            >
                              {count}P
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Target Score</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[200, 300, 400, 500].map((score) => (
                            <motion.button
                              key={score}
                              onClick={() => setGameSettings(prev => ({ ...prev, targetScore: score as 200 | 300 | 400 | 500 }))}
                              className={`p-2 rounded border-2 transition-all ${
                                gameSettings.targetScore === score
                                  ? 'border-green-400 bg-green-400/20 text-white'
                                  : 'border-white/20 bg-white/5 text-domino-300'
                              }`}
                              whileTap={{ scale: 0.95 }}
                            >
                              {score}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCreateRoom(false)}
                        className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        disabled={isConnecting}
                      >
                        Cancel
                      </button>
                      <motion.button
                        onClick={handleCreateRoom}
                        className="flex-1 game-button"
                        whileTap={{ scale: 0.98 }}
                        disabled={isConnecting}
                      >
                        {isConnecting ? 'Creating...' : 'Create'}
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>

              {/* Join Room */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">Join a Game</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Room Code</label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-domino-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
                      placeholder="ABCD"
                      maxLength={4}
                      disabled={isConnecting}
                    />
                  </div>
                  <motion.button
                    onClick={handleJoinRoom}
                    className="w-full game-button"
                    whileTap={{ scale: 0.98 }}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Joining...' : 'Join Room'}
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            /* Room Lobby */
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Room Lobby</h2>
                <button
                  onClick={handleLeaveRoom}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <UserX size={20} />
                </button>
              </div>

              {/* Room Code */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-domino-300 text-sm mb-1">Room Code</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-mono font-bold text-white">{currentRoom.id}</span>
                    <button
                      onClick={copyRoomCode}
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={shareRoom}
                      className="p-1 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                  <p className="text-domino-400 text-xs mt-1">Share this code with friends</p>
                </div>
              </div>

              {/* Players */}
              <div className="space-y-2 mb-4">
                <h3 className="text-white font-semibold">Players ({currentRoom.players.length}/{currentRoom.gameSettings.playerCount})</h3>
                {currentRoom.players.map((player) => (
                  <motion.div
                    key={player.id}
                    className={`p-3 rounded-lg border ${
                      player.isReady || player.isHost
                        ? 'border-green-400/50 bg-green-400/10'
                        : 'border-white/20 bg-white/5'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{player.avatar}</span>
                        <span className="text-white font-medium">{player.name}</span>
                        {player.isHost && <Crown className="text-yellow-400" size={16} />}
                      </div>
                      <div className="flex items-center gap-1">
                        {player.isReady || player.isHost ? (
                          <UserCheck className="text-green-400" size={16} />
                        ) : (
                          <UserX className="text-red-400" size={16} />
                        )}
                        <span className="text-xs text-domino-300">
                          {player.isHost ? 'Host' : player.isReady ? 'Ready' : 'Not Ready'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {!currentRoom.players.find(p => p.id === user.id)?.isHost && (
                  <motion.button
                    onClick={handleToggleReady}
                    className={`w-full px-4 py-3 font-semibold rounded-lg transition-colors ${
                      currentRoom.players.find(p => p.id === user.id)?.isReady
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    {currentRoom.players.find(p => p.id === user.id)?.isReady ? 'Not Ready' : 'Ready Up!'}
                  </motion.button>
                )}

                {currentRoom.players.find(p => p.id === user.id)?.isHost && (
                  <motion.button
                    onClick={handleStartGame}
                    disabled={!getMultiplayerService().canStartGame()}
                    className="w-full game-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play size={18} />
                    Start Game
                  </motion.button>
                )}
              </div>

              {/* Game Settings Preview */}
              <div className="mt-4 bg-white/5 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2 text-sm">Game Settings</h4>
                <div className="text-xs text-domino-300 space-y-1">
                  <div>Players: {currentRoom.gameSettings.playerCount}</div>
                  <div>Target Score: {currentRoom.gameSettings.targetScore}</div>
                  <div>Mode: {useFirebase ? 'Online' : 'Local'}</div>
                </div>
              </div>
            </div>
          )}

          {/* How it Works */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              {useFirebase ? 'Online Multiplayer' : 'Local Multiplayer'}
            </h3>
            <div className="space-y-2 text-sm text-domino-300">
              {useFirebase ? (
                <>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">1.</span>
                    <span>Create a room with a 4-letter code</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span>Share the code with friends anywhere</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">3.</span>
                    <span>They join from their own devices</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">4.</span>
                    <span>Play together in real-time!</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">1.</span>
                    <span>Create a room on this device</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">2.</span>
                    <span>Friends join from the same device</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">3.</span>
                    <span>Take turns on one screen</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">4.</span>
                    <span>Perfect for local gatherings!</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default MultiplayerPage