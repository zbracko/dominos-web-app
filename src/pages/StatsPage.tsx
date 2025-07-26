import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Target, Clock, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const StatsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-4 flex items-center">
          <Link
            to="/"
            className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="ml-4 text-xl font-bold text-white">Statistics</h1>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            className="glass-card p-8 text-center max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
            <p className="text-domino-300 mb-6">
              Sign in to track your game statistics and progress.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Login to View Stats
            </Link>
          </motion.div>
        </main>
      </div>
    )
  }

  const stats = user.stats
  const achievements = [
    {
      title: 'First Victory',
      description: 'Win your first game',
      completed: stats.gamesWon > 0,
      icon: '🏆'
    },
    {
      title: 'Winning Streak',
      description: 'Win 5 games in a row',
      completed: stats.winStreak >= 5,
      icon: '🔥'
    },
    {
      title: 'Century Club',
      description: 'Play 100 games',
      completed: stats.gamesPlayed >= 100,
      icon: '💯'
    },
    {
      title: 'Master Player',
      description: 'Achieve 75% win rate (min 20 games)',
      completed: stats.gamesPlayed >= 20 && stats.winRate >= 75,
      icon: '👑'
    }
  ]

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
        <h1 className="ml-4 text-xl font-bold text-white">Statistics</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <motion.div
          className="max-w-md mx-auto space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Player Info */}
          <div className="glass-card p-6 text-center">
            <div className="text-4xl mb-3">👤</div>
            <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
            <p className="text-domino-300">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <Link
                to="/history"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
              >
                📊 View History
              </Link>
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              className="glass-card p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Trophy className="mx-auto mb-2 text-yellow-400" size={24} />
              <div className="text-2xl font-bold text-white">{stats.gamesWon}</div>
              <div className="text-sm text-domino-300">Wins</div>
            </motion.div>

            <motion.div
              className="glass-card p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Target className="mx-auto mb-2 text-blue-400" size={24} />
              <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
              <div className="text-sm text-domino-300">Games</div>
            </motion.div>

            <motion.div
              className="glass-card p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <TrendingUp className="mx-auto mb-2 text-green-400" size={24} />
              <div className="text-2xl font-bold text-white">
                {stats.gamesPlayed > 0 ? Math.round(stats.winRate) : 0}%
              </div>
              <div className="text-sm text-domino-300">Win Rate</div>
            </motion.div>

            <motion.div
              className="glass-card p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Clock className="mx-auto mb-2 text-purple-400" size={24} />
              <div className="text-2xl font-bold text-white">{stats.winStreak}</div>
              <div className="text-sm text-domino-300">Win Streak</div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/history"
                className="flex items-center justify-center gap-2 p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors"
              >
                <span className="text-lg">📊</span>
                <span className="text-white text-sm">Game History</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center justify-center gap-2 p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors"
              >
                <span className="text-lg">🎮</span>
                <span className="text-white text-sm">New Game</span>
              </Link>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Detailed Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-domino-300">Games Lost</span>
                <span className="text-white font-medium">
                  {stats.gamesPlayed - stats.gamesWon}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-domino-300">Best Score</span>
                <span className="text-white font-medium">{stats.bestScore || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-domino-300">Average Score</span>
                <span className="text-white font-medium">
                  {stats.averageScore ? Math.round(stats.averageScore) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-domino-300">Total Points Scored</span>
                <span className="text-white font-medium">{stats.totalPointsScored || 0}</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    achievement.completed
                      ? 'border-green-400 bg-green-400/20'
                      : 'border-white/20 bg-white/5'
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <div className={`text-sm font-medium ${
                    achievement.completed ? 'text-green-300' : 'text-domino-400'
                  }`}>
                    {achievement.title}
                  </div>
                  <div className="text-xs text-domino-400 mt-1">
                    {achievement.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          {stats.gamesPlayed > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-domino-300">Wins</span>
                  <div className="flex-1 mx-3 bg-white/10 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(stats.gamesWon / stats.gamesPlayed) * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-sm">{stats.gamesWon}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-domino-300">Losses</span>
                  <div className="flex-1 mx-3 bg-white/10 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${((stats.gamesPlayed - stats.gamesWon) / stats.gamesPlayed) * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-sm">{stats.gamesPlayed - stats.gamesWon}</span>
                </div>
              </div>
            </div>
          )}

          {/* No Games Message */}
          {stats.gamesPlayed === 0 && (
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-3">🎲</div>
              <h3 className="text-lg font-semibold text-white mb-2">No Games Yet</h3>
              <p className="text-domino-300 mb-4">
                Start playing to see your statistics here!
              </p>
              <Link
                to="/settings"
                className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Start Your First Game
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

export default StatsPage