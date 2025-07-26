import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Users, Trophy, BookOpen, User, LogOut, RefreshCw, Pause } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useGame } from '../contexts/GameContext'
import { GameSettings } from '../types'

const HomePage: React.FC = () => {
  const { user, logout } = useAuth()
  const { startNewGame, loadGame, hasSavedGame, resetGame } = useGame()
  const navigate = useNavigate()

  const handleQuickPlay = () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Start a quick 2-player game with computer
    const quickSettings: GameSettings = {
      playerCount: 2,
      targetScore: 300,
      hasComputerPlayers: true,
      computerCount: 1,
      difficulty: 'medium'
    }
    
    startNewGame(quickSettings)
    navigate('/game')
  }

  const handleContinueGame = () => {
    if (!user) {
      navigate('/login')
      return
    }

    const success = loadGame()
    if (success) {
      navigate('/game')
    }
  }

  const handleNewGame = () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Clear any saved game and start fresh
    resetGame()
    navigate('/settings')
  }

  const menuItems = [
    // Continue Game appears first if there's a saved game
    ...(hasSavedGame ? [{
      title: 'Continue Game',
      description: 'Resume your saved game',
      icon: Pause,
      color: 'from-emerald-500 to-emerald-600',
      onClick: handleContinueGame,
      primary: true,
      requireAuth: true
    }] : []),
    {
      title: 'Quick Play',
      description: 'Play against computer',
      icon: Play,
      color: 'from-blue-500 to-blue-600',
      onClick: handleQuickPlay,
      primary: !hasSavedGame,
      requireAuth: true
    },
    {
      title: 'New Game',
      description: 'Start a custom match',
      icon: RefreshCw,
      color: 'from-green-500 to-green-600',
      onClick: handleNewGame,
      requireAuth: true
    },
    {
      title: 'Play with Friends',
      description: 'Online multiplayer',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      to: '/multiplayer',
      requireAuth: true
    },
    {
      title: 'Statistics',
      description: 'View your game history',
      icon: Trophy,
      color: 'from-purple-500 to-purple-600',
      to: '/stats',
      requireAuth: true
    },
    {
      title: 'How to Play',
      description: 'Learn the rules',
      icon: BookOpen,
      color: 'from-orange-500 to-orange-600',
      to: '/rules'
    }
  ]

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.requireAuth && !user) {
      navigate('/login')
      return
    }
    
    if (item.onClick) {
      item.onClick()
    } else if (item.to) {
      navigate(item.to)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="text-3xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🎲
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-white">Dominos</h1>
            <p className="text-domino-300 text-sm">Block game fun</p>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 mr-3 group"
              >
                <div className="text-2xl">{user.avatar}</div>
                <div className="text-right">
                  <div className="text-white font-medium group-hover:text-blue-300 transition-colors">
                    {user.username}
                  </div>
                  <div className="text-domino-300 text-sm">
                    {user.stats.gamesWon}/{user.stats.gamesPlayed} wins
                  </div>
                </div>
              </Link>
              <motion.button
                onClick={logout}
                className="p-2 text-white hover:text-red-300 transition-colors rounded-full hover:bg-white/10"
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={20} />
              </motion.button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <User size={18} />
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          className="w-full max-w-sm space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <motion.div
              className="text-6xl mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                repeatDelay: 2 
              }}
            >
              ⚫⚪
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {user ? `Welcome back, ${user.username}!` : 'Welcome to Dominos'}
            </h2>
            <p className="text-domino-300">
              {user 
                ? (hasSavedGame ? 'You have a game in progress!' : 'Ready for another match?')
                : 'The classic tile-matching game'
              }
            </p>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.button
                  onClick={() => handleMenuClick(item)}
                  className="w-full block group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`glass-card p-4 group-hover:bg-white/15 transition-all duration-300 ${
                    item.primary ? 'ring-2 ring-blue-400/50' : ''
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${item.color} group-hover:shadow-lg transition-all duration-300`}>
                        <item.icon size={24} className="text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-white font-semibold group-hover:text-blue-300 transition-colors">
                          {item.title}
                          {item.primary && <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded-full">RECOMMENDED</span>}
                        </h3>
                        <p className="text-domino-300 text-sm">
                          {item.description}
                        </p>
                      </div>
                      <motion.div
                        className="text-domino-400 group-hover:text-white group-hover:translate-x-1 transition-all"
                      >
                        →
                      </motion.div>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* User Stats Preview */}
          {user && user.stats.gamesPlayed > 0 && (
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400" />
                Your Progress
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{user.stats.gamesPlayed}</div>
                  <div className="text-xs text-domino-300">Games</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{Math.round(user.stats.winRate)}%</div>
                  <div className="text-xs text-domino-300">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{user.stats.bestScore}</div>
                  <div className="text-xs text-domino-300">Best Score</div>
                </div>
              </div>
              
              {user.stats.winStreak > 0 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-400/30">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-yellow-400">🔥</span>
                    <span className="text-white font-medium">
                      {user.stats.winStreak} game win streak!
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Guest CTA */}
          {!user && (
            <motion.div 
              className="glass-card p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-white mb-2">Join the Community!</h3>
              <p className="text-domino-300 text-sm mb-4">
                Create an account to save your progress, track stats, and compete with friends.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                <User size={18} />
                Get Started
              </Link>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-domino-400 text-sm">
          Made with ❤️ for domino enthusiasts
        </p>
      </footer>
    </div>
  )
}

export default HomePage