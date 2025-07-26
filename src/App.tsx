import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/HomePage.tsx'
import GamePage from './pages/GamePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import StatsPage from './pages/StatsPage.tsx'
import RulesPage from './pages/RulesPage.tsx'
import SettingsPage from './pages/SettingsPage.tsx'
import HistoryPage from './pages/HistoryPage.tsx'
import MultiplayerPage from './pages/MultiplayerPage.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { GameProvider } from './contexts/GameContext.tsx'

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-domino-900 via-domino-800 to-domino-900">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/game" element={<GamePage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/rules" element={<RulesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/multiplayer" element={<MultiplayerPage />} />
            </Routes>
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  borderRadius: '8px',
                }
              }}
            />
          </div>
        </Router>
      </GameProvider>
    </AuthProvider>
  )
}

export default App