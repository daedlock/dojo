import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Layout } from '@/components/layout/Layout'
import { ScrollToTop } from '@/components/router/ScrollToTop'
import { initializeStores } from '@/stores'
import { useEffect } from 'react'
import DojoList from '@/pages/DojoList'
import DojoDetail from '@/pages/DojoDetail'
import ModuleDetail from '@/pages/ModuleDetail'
import WorkspacePage from '@/pages/WorkspacePage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import CommunityPage from '@/pages/CommunityPage'
import MarkdownTest from '@/pages/MarkdownTest'
import { ClerkLoginForm, ClerkSignupForm, ForgotPasswordForm } from '@/components/auth'

function App() {
  useEffect(() => {
    // Initialize all stores on app start
    initializeStores()
  }, [])

  return (
    <ThemeProvider defaultTheme="system" storageKey="dojo-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router>
            <ScrollToTop />
            <Routes>
            {/* Main Application Routes */}
            <Route path="/" element={<Layout><DojoList /></Layout>} />
            <Route path="/dojo/:dojoId" element={<Layout><DojoDetail /></Layout>} />
            <Route path="/dojo/:dojoId/module/:moduleId" element={<Layout><ModuleDetail /></Layout>} />
            <Route path="/dojo/:dojoId/module/:moduleId/challenge/:challengeId" element={<WorkspacePage />} />
            <Route path="/dojo/:dojoId/module/:moduleId/resource/:resourceId" element={<WorkspacePage />} />
            <Route path="/workspace/:dojoId/:moduleId" element={<WorkspacePage />} />
            <Route path="/leaderboard" element={<Layout><LeaderboardPage /></Layout>} />
            <Route path="/community" element={<Layout><CommunityPage /></Layout>} />
            <Route path="/test-markdown" element={<Layout><MarkdownTest /></Layout>} />

            {/* Authentication Routes - without Layout (they have their own full-screen design) */}
            <Route path="/login" element={<ClerkLoginForm />} />
            <Route path="/register" element={<ClerkSignupForm />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
