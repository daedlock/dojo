import { Header } from './Header'
import { HeaderProvider } from '@/contexts/HeaderContext'
import { ActiveChallengeWidget } from '@/components/workspace/ActiveChallengeWidget'
import { useUIStore } from '@/stores'
import { workspaceService } from '@/services/workspace'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const activeChallenge = useUIStore(state => state.activeChallenge)
  const setActiveChallenge = useUIStore(state => state.setActiveChallenge)

  const handleKillChallenge = async () => {
    try {
      // Call the workspace termination API
      const result = await workspaceService.terminateWorkspace()

      if (result.success) {
        console.log('Workspace terminated successfully')
        setActiveChallenge(null)
      } else {
        console.error('Failed to terminate workspace:', result.error)
      }
    } catch (error) {
      console.error('Failed to terminate workspace:', error)
      // Still clear the active challenge state even if the API call fails
      setActiveChallenge(null)
    }
  }

  return (
    <HeaderProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>{children}</main>

        {/* Active Challenge Widget - shows when there's an active challenge and we're not on the challenge page */}
        <ActiveChallengeWidget
          activeChallenge={activeChallenge}
          onKillChallenge={handleKillChallenge}
        />
      </div>
    </HeaderProvider>
  )
}