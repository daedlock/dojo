import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import DojoList from '@/pages/DojoList'
import DojoDetail from '@/pages/DojoDetail'
import ModuleDetail from '@/pages/ModuleDetail'
import ChallengeDetail from '@/pages/ChallengeDetail'

function App() {
  return (
    <div className="dark">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<DojoList />} />
            <Route path="/dojo/:dojoId" element={<DojoDetail />} />
            <Route path="/dojo/:dojoId/module/:moduleId" element={<ModuleDetail />} />
            <Route path="/dojo/:dojoId/module/:moduleId/challenge/:challengeId" element={<ChallengeDetail />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </div>
  )
}

export default App
