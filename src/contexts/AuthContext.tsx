import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserProfile, AuthContextType, UserStats, UserPreferences, SavedGameData } from '../types'
import UserService from '../utils/userService'
import toast from 'react-hot-toast'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const userService = UserService.getInstance()

  useEffect(() => {
    // Check for existing session on mount
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      setIsLoading(true)
      const userData = userService.getCurrentUser()
      if (userData) {
        const userProfile = userService.getUserProfile(userData.id)
        if (userProfile) {
          setUser(userProfile)
          setIsAuthenticated(true)
        }
      }
    } catch (error) {
      console.error('Auth state check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, _password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const userData = userService.loginUser(email)
      if (userData) {
        const userProfile = userService.getUserProfile(userData.id)
        if (userProfile) {
          setUser(userProfile)
          setIsAuthenticated(true)
          toast.success('Successfully logged in!')
          return true
        }
      }
      toast.error('Invalid email or user not found.')
      return false
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Login failed. Please check your credentials.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, _password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const userData = userService.registerUser(username, email)
      if (userData) {
        const userProfile = userService.getUserProfile(userData.id)
        if (userProfile) {
          setUser(userProfile)
          setIsAuthenticated(true)
          toast.success('Account created successfully!')
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Registration failed:', error)
      toast.error('Registration failed. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    try {
      userService.logoutUser()
      setUser(null)
      setIsAuthenticated(false)
      toast.success('Successfully logged out!')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout failed. Please try again.')
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false
    
    try {
      // Update user preferences if provided
      if (updates.preferences) {
        userService.updateUserPreferences(user.id, updates.preferences)
      }
      
      // Update avatar if provided
      if (updates.avatar) {
        userService.updateUserAvatar(user.id, updates.avatar)
      }
      
      // Get updated profile
      const updatedProfile = userService.getUserProfile(user.id)
      if (updatedProfile) {
        setUser(updatedProfile)
        toast.success('Profile updated successfully!')
        return true
      }
      return false
    } catch (error) {
      console.error('Profile update failed:', error)
      toast.error('Failed to update profile.')
      return false
    }
  }

  const updateStats = (newStats: UserStats): void => {
    if (!user) return
    
    try {
      userService.updateUserStats(user.id, newStats)
      const updatedProfile = userService.getUserProfile(user.id)
      if (updatedProfile) {
        setUser(updatedProfile)
      }
    } catch (error) {
      console.error('Stats update failed:', error)
    }
  }

  const updatePreferences = (preferences: Partial<UserPreferences>): void => {
    if (!user) return
    
    try {
      userService.updateUserPreferences(user.id, preferences)
      const updatedProfile = userService.getUserProfile(user.id)
      if (updatedProfile) {
        setUser(updatedProfile)
        toast.success('Preferences updated!')
      }
    } catch (error) {
      console.error('Preferences update failed:', error)
      toast.error('Failed to update preferences.')
    }
  }

  const saveGameState = (gameData: SavedGameData): void => {
    if (!user) return
    
    try {
      userService.saveCurrentGameState(gameData)
    } catch (error) {
      console.error('Save game failed:', error)
      toast.error('Failed to save game.')
    }
  }

  const loadGameState = (): SavedGameData | null => {
    if (!user) return null
    
    try {
      return userService.loadCurrentGameState()
    } catch (error) {
      console.error('Load game failed:', error)
      return null
    }
  }

  const clearGameState = (): void => {
    if (!user) return
    
    try {
      userService.clearCurrentGameState()
    } catch (error) {
      console.error('Clear game state failed:', error)
    }
  }

  const addFriend = async (_friendId: string): Promise<boolean> => {
    if (!user) return false
    
    try {
      // This would need to be implemented in UserService
      // For now, return false as it's not implemented
      toast.error('Friend functionality not yet implemented.')
      return false
    } catch (error) {
      console.error('Add friend failed:', error)
      return false
    }
  }

  const removeFriend = async (_friendId: string): Promise<boolean> => {
    if (!user) return false
    
    try {
      // This would need to be implemented in UserService
      // For now, return false as it's not implemented
      toast.error('Friend functionality not yet implemented.')
      return false
    } catch (error) {
      console.error('Remove friend failed:', error)
      return false
    }
  }

  const unlockAchievement = (achievementId: string): void => {
    if (!user) return
    
    try {
      // This would need to be implemented in UserService
      // For now, just log it
      console.log('Achievement unlocked:', achievementId)
    } catch (error) {
      console.error('Unlock achievement failed:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updateStats,
    updatePreferences,
    saveGameState,
    loadGameState,
    clearGameState,
    addFriend,
    removeFriend,
    unlockAchievement
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}