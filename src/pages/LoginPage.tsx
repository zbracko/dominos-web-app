import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, UserPlus, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

const LoginPage: React.FC = () => {
  const { register, login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    // For demo purposes, we'll use a simple password
    const demoPassword = 'demo123'

    setIsSubmitting(true)

    try {
      if (isRegisterMode) {
        // Registration mode
        if (!username.trim()) {
          toast.error('Please enter a username')
          return
        }

        const success = await register(username.trim(), email.trim(), demoPassword)
        if (success) {
          navigate('/')
        }
      } else {
        // Login mode
        const success = await login(email.trim(), demoPassword)
        if (success) {
          navigate('/')
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModeSwitch = () => {
    setIsRegisterMode(!isRegisterMode)
    if (!isRegisterMode) {
      setUsername('')
    }
  }

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
        <h1 className="ml-4 text-xl font-bold text-white">
          {isRegisterMode ? 'Create Account' : 'Welcome Back'}
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-card p-6">
            <div className="text-center mb-6">
              <motion.div
                className="text-4xl mb-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                {isRegisterMode ? '🎯' : '🎲'}
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isRegisterMode ? 'Join the Game!' : 'Welcome Back!'}
              </h2>
              <p className="text-domino-300">
                {isRegisterMode 
                  ? 'Create your dominos profile to start playing' 
                  : 'Enter your email to continue your dominos journey'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegisterMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-white text-sm font-medium mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-domino-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-domino-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Choose a username"
                      required={isRegisterMode}
                      minLength={3}
                      maxLength={20}
                    />
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-domino-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-domino-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-domino-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-domino-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full game-button disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting || isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    {isRegisterMode ? 'Creating Account...' : 'Logging in...'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {isRegisterMode ? <UserPlus size={18} /> : <LogIn size={18} />}
                    {isRegisterMode ? 'Create Account & Play' : 'Login & Continue'}
                  </div>
                )}
              </motion.button>
            </form>

            {/* Mode Switch */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleModeSwitch}
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                disabled={isSubmitting || isLoading}
              >
                {isRegisterMode 
                  ? 'Already have an account? Login instead' 
                  : 'New to dominos? Create an account'
                }
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-domino-300 text-sm">
                Need help?{' '}
                <Link
                  to="/rules"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Learn the rules
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default LoginPage