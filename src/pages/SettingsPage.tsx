import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Target, Bot, Zap, Play } from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { useAuth } from '../contexts/AuthContext'
import { GameSettings } from '../types'

const SettingsPage: React.FC = () => {
  const { gameSettings, updateSettings, startNewGame } = useGame()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  // Provide default settings if gameSettings is null
  const defaultSettings: GameSettings = {
    playerCount: 2,
    targetScore: 300,
    hasComputerPlayers: true,
    computerCount: 1,
    difficulty: 'medium'
  }
  
  const [localSettings, setLocalSettings] = useState<GameSettings>(gameSettings || defaultSettings)

  const handleStartGame = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    updateSettings(localSettings)
    startNewGame(localSettings)
    navigate('/game')
  }

  const updateLocalSetting = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    setLocalSettings(prev => {
      const updated = { ...prev, [key]: value }
      
      // Auto-adjust computer count when enabling/disabling computer players
      if (key === 'hasComputerPlayers') {
        if (value) {
          updated.computerCount = Math.min(1, updated.playerCount - 1)
        } else {
          updated.computerCount = 0
        }
      }
      
      // Ensure computer count doesn't exceed available slots
      if (key === 'playerCount') {
        updated.computerCount = Math.min(updated.computerCount, (value as number) - 1)
      }
      
      return updated
    })
  }

  const playerCountOptions = [2, 3, 4] as const
  const targetScoreOptions = [200, 300, 400, 500] as const
  const difficultyOptions = [
    { value: 'easy', label: 'Easy', description: 'Computer makes basic moves' },
    { value: 'medium', label: 'Medium', description: 'Computer uses good strategy' },
    { value: 'hard', label: 'Hard', description: 'Computer plays optimally' }
  ] as const

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center">
        <Link
          to="/"
          className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="ml-4 text-xl font-bold text-white">Game Settings</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <motion.div
          className="max-w-md mx-auto space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Player Count */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-blue-400" size={24} />
              <h2 className="text-lg font-semibold text-white">Players</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {playerCountOptions.map((count) => (
                <motion.button
                  key={count}
                  onClick={() => updateLocalSetting('playerCount', count)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    localSettings.playerCount === count
                      ? 'border-blue-400 bg-blue-400/20 text-white'
                      : 'border-white/20 bg-white/5 text-domino-300 hover:bg-white/10'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-xl font-bold">{count}</div>
                  <div className="text-xs opacity-80">Players</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Target Score */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-green-400" size={24} />
              <h2 className="text-lg font-semibold text-white">Target Score</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {targetScoreOptions.map((score) => (
                <motion.button
                  key={score}
                  onClick={() => updateLocalSetting('targetScore', score)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    localSettings.targetScore === score
                      ? 'border-green-400 bg-green-400/20 text-white'
                      : 'border-white/20 bg-white/5 text-domino-300 hover:bg-white/10'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-lg font-bold">{score}</div>
                  <div className="text-xs opacity-80">Points</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Computer Players */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="text-purple-400" size={24} />
              <h2 className="text-lg font-semibold text-white">Computer Players</h2>
            </div>
            
            {/* Enable/Disable Computer Players */}
            <div className="mb-4">
              <motion.button
                onClick={() => updateLocalSetting('hasComputerPlayers', !localSettings.hasComputerPlayers)}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  localSettings.hasComputerPlayers
                    ? 'border-purple-400 bg-purple-400/20 text-white'
                    : 'border-white/20 bg-white/5 text-domino-300 hover:bg-white/10'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {localSettings.hasComputerPlayers ? '🤖 Computer Enabled' : '👥 Humans Only'}
              </motion.button>
            </div>

            {/* Computer Count */}
            {localSettings.hasComputerPlayers && (
              <div className="space-y-3">
                <label className="block text-white text-sm font-medium">
                  Number of Computer Players: {localSettings.computerCount}
                </label>
                <div className="flex gap-2">
                  {Array.from({ length: localSettings.playerCount - 1 }, (_, i) => i + 1).map((count) => (
                    <motion.button
                      key={count}
                      onClick={() => updateLocalSetting('computerCount', count)}
                      className={`flex-1 p-2 rounded border-2 transition-all ${
                        localSettings.computerCount === count
                          ? 'border-purple-400 bg-purple-400/20 text-white'
                          : 'border-white/20 bg-white/5 text-domino-300 hover:bg-white/10'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {count}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Difficulty */}
          {localSettings.hasComputerPlayers && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-yellow-400" size={24} />
                <h2 className="text-lg font-semibold text-white">Difficulty</h2>
              </div>
              
              <div className="space-y-2">
                {difficultyOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => updateLocalSetting('difficulty', option.value)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      localSettings.difficulty === option.value
                        ? 'border-yellow-400 bg-yellow-400/20 text-white'
                        : 'border-white/20 bg-white/5 text-domino-300 hover:bg-white/10'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-80">{option.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Start Game Button */}
          <motion.button
            onClick={handleStartGame}
            className="w-full game-button flex items-center justify-center gap-3"
            whileTap={{ scale: 0.98 }}
          >
            <Play size={20} />
            Start Game
          </motion.button>

          {/* Game Summary */}
          <div className="glass-card p-4">
            <h3 className="text-white font-medium mb-2">Game Summary</h3>
            <div className="text-sm text-domino-300 space-y-1">
              <div>👥 {localSettings.playerCount} players total</div>
              {localSettings.hasComputerPlayers && (
                <>
                  <div>🤖 {localSettings.computerCount} computer player(s)</div>
                  <div>⚡ {localSettings.difficulty} difficulty</div>
                </>
              )}
              <div>🎯 First to {localSettings.targetScore} points wins</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default SettingsPage