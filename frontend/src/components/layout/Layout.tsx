import { Header } from './Header'
import { HeaderProvider } from '@/contexts/HeaderContext'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <HeaderProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>{children}</main>
      </div>
    </HeaderProvider>
  )
}