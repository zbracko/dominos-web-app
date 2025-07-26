import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, Users, Target, Calendar, TrendingUp, Award } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import GameHistoryService from '../utils/gameHistoryService'
import { GameHistory, Achievement } from '../types'

const HistoryPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [selectedGame, setSelectedGame] = useState<GameHistory | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'wins' | 'losses'>('all')
  const [isLoading, setIsLoading] = useState(true)

  const gameHistoryService = GameHistoryService.getInstance()

  useEffect(() => {
    if (!user?.id) return

    setIsLoading(true)
    
    // Load game history
    const history = gameHistoryService.getUserGameHistory(user.id, 50)
    setGameHistory(history)

    // Load achievements
    const userAchievements = gameHistoryService.checkAchievements(user.id, user.stats)
    setAchievements(userAchievements)

    // Load analytics
    const analyticsData = gameHistoryService.getGameAnalytics(user.id)
    setAnalytics(analyticsData)

    setIsLoading(false)
  }, [user?.id])

  const filteredGames = gameHistory.filter(game => {
    if (filterType === 'all') return true
    const userWon = game.winner.id === user?.id
    return filterType === 'wins' ? userWon : !userWon
  })

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-4 flex items-center flex-shrink-0">
          <Link to="/" className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="ml-4 text-xl font-bold text-white">Game History</h1>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div className="glass-card p-6 text-center max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-4xl mb-3">📊</div>
            <h2 className="text-lg font-bold text-white mb-2">Login Required</h2>
            <p className="text-domino-300 text-sm mb-4">Sign in to view your game history and achievements.</p>
            <Link to="/login" className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
              Login to View History
            </Link>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-3 flex items-center justify-between flex-shrink-0 bg-domino-800/50 backdrop-blur-sm">
        <div className="flex items-center">
          <Link to="/stats" className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="ml-3 text-lg font-bold text-white">Game History</h1>
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="wins">Wins</option>
          <option value="losses">Losses</option>
        </select>
      </header>

      <main className="flex-1 overflow-y-auto p-3">
        <motion.div className="max-w-md mx-auto space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* Quick Stats Overview */}
          {analytics && (
            <div className="glass-card p-3">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                <TrendingUp size={16} className="text-blue-400" />
                Performance
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{analytics.winsByTargetScore[200] + analytics.winsByTargetScore[300] + analytics.winsByTargetScore[400] + analytics.winsByTargetScore[500]}</div>
                  <div className="text-xs text-domino-300">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{formatDuration(analytics.averageGameDuration)}</div>
                  <div className="text-xs text-domino-300">Avg Game</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{Math.floor(analytics.totalPlayTime / 60000)}m</div>
                  <div className="text-xs text-domino-300">Total Time</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Achievements */}
          {achievements.length > 0 && (
            <div className="glass-card p-3">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                <Award size={16} className="text-yellow-400" />
                Latest Achievements
              </h3>
              <div className="space-y-2">
                {achievements.slice(0, 2).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    className="flex items-center gap-2 p-2 bg-yellow-400/10 rounded-lg border border-yellow-400/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-lg">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-yellow-300 font-medium text-xs">{achievement.title}</div>
                      <div className="text-yellow-400/70 text-xs truncate">{achievement.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Game History List */}
          <div className="glass-card p-3">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-green-400" />
              Match History ({filteredGames.length})
            </h3>
            
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white/5 rounded-lg p-2 animate-pulse">
                    <div className="h-3 bg-white/10 rounded mb-1"></div>
                    <div className="h-2 bg-white/10 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🎲</div>
                <p className="text-domino-300 text-sm">No games found</p>
                <p className="text-domino-400 text-xs">Start playing to build your history!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredGames.map((game, index) => {
                  const userWon = game.winner.id === user.id
                  const userScore = game.finalScores[user.id] || 0
                  
                  return (
                    <motion.button
                      key={game.id}
                      onClick={() => setSelectedGame(game)}
                      className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`text-sm ${userWon ? 'text-green-400' : 'text-red-400'}`}>
                            {userWon ? '🏆' : '💔'}
                          </div>
                          <div className="text-white font-medium text-sm">
                            {userWon ? 'Victory' : 'Defeat'}
                          </div>
                        </div>
                        <div className="text-domino-300 text-xs">
                          {formatDate(game.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-domino-300">
                          <span className="flex items-center gap-1">
                            <Users size={10} />
                            {game.players.length}P
                          </span>
                          <span className="flex items-center gap-1">
                            <Target size={10} />
                            {game.targetScore}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatDuration(game.duration)}
                          </span>
                        </div>
                        <div className={`font-medium text-xs ${userWon ? 'text-green-400' : 'text-red-400'}`}>
                          {userScore} pts
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Game Detail Modal */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              className="bg-domino-800 rounded-2xl p-4 max-w-sm w-full max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Game Details</h3>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="text-domino-400 hover:text-white transition-colors text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {/* Game Info */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-domino-300">Date</div>
                      <div className="text-white">{new Date(selectedGame.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-domino-300">Duration</div>
                      <div className="text-white">{formatDuration(selectedGame.duration)}</div>
                    </div>
                    <div>
                      <div className="text-domino-300">Target Score</div>
                      <div className="text-white">{selectedGame.targetScore} points</div>
                    </div>
                    <div>
                      <div className="text-domino-300">Players</div>
                      <div className="text-white">{selectedGame.players.length}</div>
                    </div>
                  </div>
                </div>

                {/* Final Scores */}
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="text-white font-medium mb-2 text-sm">Final Scores</h4>
                  <div className="space-y-1">
                    {selectedGame.players
                      .sort((a, b) => (selectedGame.finalScores[a.id] || 0) - (selectedGame.finalScores[b.id] || 0))
                      .map((player) => {
                        const score = selectedGame.finalScores[player.id] || 0
                        const isWinner = player.id === selectedGame.winner.id
                        
                        return (
                          <div key={player.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="text-sm">{isWinner ? '👑' : player.avatar}</div>
                              <div className={`${player.id === user?.id ? 'text-blue-300' : 'text-white'} truncate`}>
                                {player.name}
                                {player.id === user?.id && ' (You)'}
                              </div>
                            </div>
                            <div className={`font-medium ${isWinner ? 'text-green-400' : 'text-domino-300'}`}>
                              {score} pts
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Game Settings */}
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="text-white font-medium mb-2 text-sm">Game Settings</h4>
                  <div className="text-xs text-domino-300 space-y-1">
                    <div>Players: {selectedGame.gameSettings.playerCount}</div>
                    <div>Target: {selectedGame.gameSettings.targetScore} points</div>
                    <div>Computers: {selectedGame.gameSettings.computerCount}</div>
                    {selectedGame.gameSettings.hasComputerPlayers && (
                      <div>Difficulty: {selectedGame.gameSettings.difficulty}</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HistoryPage