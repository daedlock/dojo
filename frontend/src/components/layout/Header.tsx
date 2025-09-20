import { Link, useLocation, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useIsAuthenticated, useLogout } from '@/hooks/useAuth'
import {
  Menu, X, User, LogOut, Shield, Home, ChevronRight,
  BookOpen, Trophy, Users, Settings, Search, Bell,
  Terminal, Code, Monitor, Flag
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeSelector } from '@/components/ui/theme-selector'
import { useDojos } from '@/hooks/useDojo'
import { cn } from '@/lib/utils'

export function Header() {
  const { isAuthenticated, isLoading, user } = useIsAuthenticated()
  const logout = useLogout()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { dojoId } = useParams()
  const { data: dojosData } = useDojos()
  const [scrolled, setScrolled] = useState(false)

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Get current dojo info if we're on a dojo page
  const currentDojo = dojoId ? dojosData?.dojos?.find(d => d.id === dojoId) : null

  const handleLogout = async () => {
    await logout.mutateAsync()
    setMobileMenuOpen(false)
  }

  // Smart navigation items based on context
  const navItems = [
    { name: 'Dojos', href: '/', icon: BookOpen, active: location.pathname === '/' },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, active: location.pathname === '/leaderboard' },
    { name: 'Community', href: '/community', icon: Users, active: location.pathname === '/community' },
  ]

  // Breadcrumb navigation
  const getBreadcrumbs = () => {
    const crumbs = [{ name: 'DOJO', href: '/', icon: Shield }]

    if (currentDojo) {
      crumbs.push({ name: currentDojo.name, href: `/dojo/${dojoId}`, icon: BookOpen })
    }

    if (location.pathname.includes('/module/')) {
      const moduleId = location.pathname.split('/module/')[1]?.split('/')[0]
      if (moduleId) {
        crumbs.push({ name: `Module ${moduleId}`, href: `#`, icon: Terminal })
      }
    }

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b transition-all duration-300",
      scrolled
        ? "border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
        : "border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Breadcrumbs */}
          <div className="flex items-center space-x-6">
            {breadcrumbs.length > 1 ? (
              <nav className="flex items-center space-x-1 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
                    <Link
                      to={crumb.href}
                      className={cn(
                        "flex items-center space-x-1.5 px-2 py-1 rounded-md transition-colors",
                        index === breadcrumbs.length - 1
                          ? "text-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <crumb.icon className="h-4 w-4" />
                      <span>{crumb.name}</span>
                    </Link>
                  </div>
                ))}
              </nav>
            ) : (
              <Link to="/" className="flex items-center space-x-2 group">
                <Shield className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                <span className="text-xl font-bold text-foreground">DOJO</span>
              </Link>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-2 text-sm transition-colors",
                    item.active
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground font-medium"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search Button */}
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            {isAuthenticated && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-destructive rounded-full" />
              </Button>
            )}

            <div className="h-6 w-px bg-border" />

            <ThemeSelector />
            {isLoading ? (
              <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="relative group">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left hidden xl:block">
                      <div className="text-sm font-medium text-foreground">{user.name}</div>
                      <div className="text-xs text-muted-foreground">Level 5</div>
                    </div>
                  </div>
                </Button>

                {user.admin && (
                  <Badge variant="destructive" className="text-xs">
                    Admin
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" className="text-sm">
                    Login
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register" className="text-sm">
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Breadcrumbs */}
            {breadcrumbs.length > 1 && (
              <div className="pb-2 border-b border-border">
                <nav className="flex items-center space-x-1 text-xs">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.href} className="flex items-center">
                      {index > 0 && <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground" />}
                      <Link
                        to={crumb.href}
                        className="flex items-center space-x-1 text-muted-foreground"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>{crumb.name}</span>
                      </Link>
                    </div>
                  ))}
                </nav>
              </div>
            )}

            {/* Mobile Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 text-sm transition-colors",
                    item.active
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground font-medium"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Theme Selector */}
            <div className="pt-4 border-t border-border">
              <div className="flex justify-center">
                <ThemeSelector />
              </div>
            </div>

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-border">
              {isLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm">
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      {user.admin && (
                        <Badge variant="destructive" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button size="sm" className="w-full" asChild>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}