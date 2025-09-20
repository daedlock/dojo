import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Layout } from '@/components/layout/Layout'
import DojoList from '@/pages/DojoList'
import DojoDetail from '@/pages/DojoDetail'
import ModuleDetail from '@/pages/ModuleDetail'
import LeaderboardPage from '@/pages/LeaderboardPage'
import CommunityPage from '@/pages/CommunityPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="dojo-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Main Application Routes */}
            <Route path="/" element={<Layout><DojoList /></Layout>} />
            <Route path="/dojo/:dojoId" element={<Layout><DojoDetail /></Layout>} />
            <Route path="/dojo/:dojoId/module/:moduleId" element={<Layout><ModuleDetail /></Layout>} />
            <Route path="/leaderboard" element={<Layout><LeaderboardPage /></Layout>} />
            <Route path="/community" element={<Layout><CommunityPage /></Layout>} />

            {/* Authentication Routes - without Layout (they have their own full-screen design) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
