import { User, UserStats, UserProfile, UserPreferences } from '../types'
import toast from 'react-hot-toast'

interface StoredUserData {
  users: Record<string, User>
  profiles: Record<string, UserProfile>
  currentUserId: string | null
  gameStates: Record<string, any>
  sessions: Record<string, SessionData>
  version: string
}

interface SessionData {
  userId: string
  loginTime: string
  lastActivity: string
  deviceInfo: string
  isActive: boolean
}

class UserService {
  private static instance: UserService
  private readonly STORAGE_KEY = 'dominos_user_data'
  private readonly BACKUP_KEY = 'dominos_user_backup'
  private readonly DATA_VERSION = '2.0'

  private constructor() {
    this.initializeStorage()
    this.startSessionHeartbeat()
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

  private initializeStorage(): void {
    try {
      const data = this.getStoredData()
      if (!data || data.version !== this.DATA_VERSION) {
        this.migrateData(data)
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error)
      this.resetStorage()
    }
  }

  private migrateData(oldData: any): void {
    try {
      const newData: StoredUserData = {
        users: oldData?.users || {},
        profiles: {},
        currentUserId: oldData?.currentUserId || null,
        gameStates: oldData?.gameStates || {},
        sessions: {},
        version: this.DATA_VERSION
      }

      // Migrate users to profiles
      Object.values(newData.users).forEach((user: any) => {
        if (user && user.id) {
          newData.profiles[user.id] = this.createUserProfile(user)
        }
      })

      this.saveStoredData(newData)
      console.log('Data migration completed successfully')
    } catch (error) {
      console.error('Data migration failed:', error)
      this.resetStorage()
    }
  }

  private createUserProfile(user: User): UserProfile {
    const defaultPreferences: UserPreferences = {
      favoriteTargetScore: 300,
      preferredDifficulty: 'medium',
      soundEnabled: true,
      smackTalkEnabled: true,
      notifications: true,
      theme: 'dark',
      animationsEnabled: true,
      autoSave: true,
      difficulty: 'medium'
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || '👤',
      stats: user.stats,
      preferences: defaultPreferences,
      createdAt: user.createdAt,
      lastActive: new Date().toISOString(),
      gameHistory: [],
      achievements: [],
      friends: []
    }
  }

  private resetStorage(): void {
    const emptyData: StoredUserData = {
      users: {},
      profiles: {},
      currentUserId: null,
      gameStates: {},
      sessions: {},
      version: this.DATA_VERSION
    }
    this.saveStoredData(emptyData)
  }

  private getStoredData(): StoredUserData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to parse stored data:', error)
      return null
    }
  }

  private saveStoredData(data: StoredUserData): void {
    try {
      // Create backup before saving
      const currentData = this.getStoredData()
      if (currentData) {
        localStorage.setItem(this.BACKUP_KEY, JSON.stringify(currentData))
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save data:', error)
      toast.error('Failed to save user data')
    }
  }

  private startSessionHeartbeat(): void {
    setInterval(() => {
      this.updateSessionActivity()
    }, 30000) // Update every 30 seconds
  }

  private updateSessionActivity(): void {
    const data = this.getStoredData()
    if (data?.currentUserId && data.sessions[data.currentUserId]) {
      data.sessions[data.currentUserId].lastActivity = new Date().toISOString()
      this.saveStoredData(data)
    }
  }

  public registerUser(username: string, email: string): User {
    const data = this.getStoredData() || this.createEmptyData()
    
    // Check if user already exists
    const existingUser = Object.values(data.users).find(
      user => user.email.toLowerCase() === email.toLowerCase()
    )
    
    if (existingUser) {
      throw new Error('An account with this email already exists')
    }

    // Check if username is taken
    const existingUsername = Object.values(data.users).find(
      user => user.username.toLowerCase() === username.toLowerCase()
    )
    
    if (existingUsername) {
      throw new Error('This username is already taken')
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const avatars = ['👤', '🎭', '🎪', '🎨', '🎯', '🎲', '🎮', '🎸', '🎺', '🎼']
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)]

    const newUser: User = {
      id: userId,
      username: username.trim(),
      email: email.toLowerCase().trim(),
      avatar: randomAvatar,
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        winRate: 0,
        favoriteGameLength: 300,
        winStreak: 0,
        totalPointsScored: 0
      },
      createdAt: new Date().toISOString()
    }

    data.users[userId] = newUser
    data.profiles[userId] = this.createUserProfile(newUser)
    data.currentUserId = userId
    
    // Create session
    data.sessions[userId] = {
      userId,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      deviceInfo: navigator.userAgent,
      isActive: true
    }

    this.saveStoredData(data)
    return newUser
  }

  public loginUser(email: string): User | null {
    const data = this.getStoredData()
    if (!data) return null

    const user = Object.values(data.users).find(
      user => user.email.toLowerCase() === email.toLowerCase()
    )

    if (!user) return null

    // Update session
    data.currentUserId = user.id
    data.sessions[user.id] = {
      userId: user.id,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      deviceInfo: navigator.userAgent,
      isActive: true
    }

    // Update last active in profile
    if (data.profiles[user.id]) {
      data.profiles[user.id].lastActive = new Date().toISOString()
    }

    this.saveStoredData(data)
    return user
  }

  public logoutUser(): void {
    const data = this.getStoredData()
    if (!data || !data.currentUserId) return

    // Mark session as inactive
    if (data.sessions[data.currentUserId]) {
      data.sessions[data.currentUserId].isActive = false
    }

    data.currentUserId = null
    this.saveStoredData(data)
  }

  public getCurrentUser(): User | null {
    const data = this.getStoredData()
    if (!data || !data.currentUserId) return null
    return data.users[data.currentUserId] || null
  }

  public getAllUsers(): User[] {
    const data = this.getStoredData()
    return data ? Object.values(data.users) : []
  }

  public getUserProfile(userId: string): UserProfile | null {
    const data = this.getStoredData()
    return data?.profiles[userId] || null
  }

  public updateUserStats(userId: string, stats: UserStats): void {
    const data = this.getStoredData()
    if (!data || !data.users[userId]) return

    data.users[userId].stats = stats
    if (data.profiles[userId]) {
      data.profiles[userId].stats = stats
    }
    
    this.saveStoredData(data)
  }

  public updateUserAvatar(userId: string, avatar: string): void {
    const data = this.getStoredData()
    if (!data || !data.users[userId]) return

    data.users[userId].avatar = avatar
    if (data.profiles[userId]) {
      data.profiles[userId].avatar = avatar
    }
    
    this.saveStoredData(data)
  }

  public updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): void {
    const data = this.getStoredData()
    if (!data || !data.profiles[userId]) return

    data.profiles[userId].preferences = {
      ...data.profiles[userId].preferences,
      ...preferences
    }
    
    this.saveStoredData(data)
  }

  public saveCurrentGameState(gameData: any): void {
    const data = this.getStoredData()
    if (!data || !data.currentUserId) return

    data.gameStates[data.currentUserId] = {
      ...gameData,
      savedAt: new Date().toISOString()
    }
    
    this.saveStoredData(data)
  }

  public loadCurrentGameState(): any {
    const data = this.getStoredData()
    if (!data || !data.currentUserId) return null
    return data.gameStates[data.currentUserId] || null
  }

  public clearCurrentGameState(): void {
    const data = this.getStoredData()
    if (!data || !data.currentUserId) return

    delete data.gameStates[data.currentUserId]
    this.saveStoredData(data)
  }

  public userExists(email: string): boolean {
    const data = this.getStoredData()
    if (!data) return false
    
    return Object.values(data.users).some(
      user => user.email.toLowerCase() === email.toLowerCase()
    )
  }

  public validateAndRepairData(): boolean {
    try {
      const data = this.getStoredData()
      if (!data) {
        this.resetStorage()
        return true
      }

      let needsRepair = false

      // Ensure all users have profiles
      Object.values(data.users).forEach((user: User) => {
        if (!data.profiles[user.id]) {
          data.profiles[user.id] = this.createUserProfile(user)
          needsRepair = true
        }
      })

      // Clean up orphaned sessions
      Object.keys(data.sessions).forEach(userId => {
        if (!data.users[userId]) {
          delete data.sessions[userId]
          needsRepair = true
        }
      })

      // Clean up orphaned game states
      Object.keys(data.gameStates).forEach(userId => {
        if (!data.users[userId]) {
          delete data.gameStates[userId]
          needsRepair = true
        }
      })

      if (needsRepair) {
        this.saveStoredData(data)
      }

      return true
    } catch (error) {
      console.error('Data validation failed:', error)
      this.resetStorage()
      return false
    }
  }

  private createEmptyData(): StoredUserData {
    return {
      users: {},
      profiles: {},
      currentUserId: null,
      gameStates: {},
      sessions: {},
      version: this.DATA_VERSION
    }
  }

  public exportUserData(): string {
    const data = this.getStoredData()
    return JSON.stringify(data, null, 2)
  }

  public importUserData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData)
      
      // Validate imported data structure
      if (!importedData.users || !importedData.version) {
        throw new Error('Invalid data format')
      }
      
      this.saveStoredData(importedData)
      return true
    } catch (error) {
      console.error('Failed to import user data:', error)
      return false
    }
  }
}

export default UserService