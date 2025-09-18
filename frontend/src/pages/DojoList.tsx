import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDojos } from '@/hooks'
import { Loader2, AlertCircle } from 'lucide-react'

export default function DojoList() {
  const { data: dojosData, isLoading, error } = useDojos()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dojos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-semibold">Failed to load dojos</h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try again
          </Button>
        </div>
      </div>
    )
  }

  const dojos = dojosData?.dojos || []

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Security Dojos</h1>
          <p className="text-muted-foreground text-lg">
            Master cybersecurity through hands-on challenges
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            {dojos.length} dojos available
          </div>
        </div>

        {dojos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No dojos available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dojos.map((dojo) => (
              <Link key={dojo.id} to={`/dojo/${dojo.id}`}>
                <Card className="h-full hover:bg-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{dojo.name}</CardTitle>
                        {dojo.official && (
                          <Badge variant="default" className="mb-2">
                            Official
                          </Badge>
                        )}
                      </div>
                    </div>
                    {dojo.description && (
                      <CardDescription className="text-sm">
                        {dojo.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Click to explore modules and challenges
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}