import { useIsAuthenticated } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Globe, Building, MapPin, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { isAuthenticated, isLoading, user } = useIsAuthenticated()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Not Authenticated</h1>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to view your profile.
          </p>
          <Button asChild>
            <a href="http://localhost/login">Login</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
          <Button variant="outline" asChild>
            <a href="http://localhost/settings" target="_blank" rel="noopener noreferrer">
              Edit in CTFd
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
                <CardDescription>Your basic account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-foreground font-medium">{user.name}</span>
                      {user.verified && <CheckCircle className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{user.email}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.website && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={user.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {user.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {user.affiliation && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Affiliation</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{user.affiliation}</span>
                      </div>
                    </div>
                  )}
                </div>

                {user.country && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Country</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{user.country}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common account management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="http://localhost/settings" target="_blank" rel="noopener noreferrer">
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </a>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="http://localhost/settings#password" target="_blank" rel="noopener noreferrer">
                      <Shield className="h-4 w-4 mr-2" />
                      Change Password
                    </a>
                  </Button>
                </div>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Back to Dojos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <Badge variant={user.admin ? "destructive" : "secondary"}>
                    {user.admin ? "Admin" : "User"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email Verified</span>
                  <Badge variant={user.verified ? "default" : "secondary"}>
                    {user.verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Profile Visibility</span>
                  <Badge variant={user.hidden ? "secondary" : "default"}>
                    {user.hidden ? "Private" : "Public"}
                  </Badge>
                </div>
                {user.banned && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="destructive">Banned</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            {user.bracket && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Competition Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bracket</span>
                    <Badge variant="outline">{user.bracket}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}