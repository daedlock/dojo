import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDojoModules, useDojoSolves, useDojos } from '@/hooks/useDojo'
import { DojoWorkspaceLayout } from '@/components/layout/DojoWorkspaceLayout'
import { Markdown } from '@/components/ui/markdown'
import { Loader2, AlertCircle, ArrowLeft, BookOpen, Users, Trophy, Clock, Target } from 'lucide-react'

export default function DojoDetail() {
  const { dojoId } = useParams()
  const navigate = useNavigate()

  // State for active challenge
  const [activeChallenge, setActiveChallenge] = useState<{
    dojoId: string
    moduleId: string
    challengeId: string
    name: string
  } | undefined>(undefined)

  // State for description expansion
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const {
    data: dojosData,
    isLoading: isLoadingDojo,
    error: dojoError
  } = useDojos()

  const {
    data: modulesData,
    isLoading: isLoadingModules,
    error: modulesError
  } = useDojoModules(dojoId || '', !!dojoId)

  const {
    data: solvesData
  } = useDojoSolves(dojoId || '', undefined, !!dojoId)

  // Handle challenge start
  const handleChallengeStart = (dojoId: string, moduleId: string, challengeId: string) => {
    const module = modulesData?.modules?.find(m => m.id === moduleId)
    const challenge = module?.challenges?.find(c => c.id === challengeId)

    if (challenge) {
      setActiveChallenge({
        dojoId,
        moduleId,
        challengeId,
        name: challenge.name
      })
    }
  }

  // Handle challenge close
  const handleChallengeClose = () => {
    setActiveChallenge(undefined)
  }

  if (!dojoId) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Dojo not found</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dojos
          </Button>
        </div>
      </div>
    )
  }

  if (isLoadingDojo || isLoadingModules) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dojo...</p>
        </div>
      </div>
    )
  }

  if (dojoError || modulesError || !modulesData?.success) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Failed to load dojo</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dojos
          </Button>
        </div>
      </div>
    )
  }

  const modules = modulesData.modules || []
  const solves = solvesData?.solves || []
  const dojo = dojosData?.dojos?.find(d => d.id === dojoId)

  // Create a set of solved challenge IDs for quick lookup
  const solvedChallengeIds = new Set(solves.map(solve => solve.challenge_id))

  // Calculate stats
  const totalChallenges = modules.reduce((acc, mod) => acc + (mod.challenges?.length || 0), 0)
  const solvedCount = solves.length
  const progressPercentage = totalChallenges > 0 ? Math.round((solvedCount / totalChallenges) * 100) : 0

  // Transform modules data for the layout component
  const layoutModules = modules.map(module => ({
    id: module.id,
    name: module.name,
    description: module.description,
    challenges: (module.challenges || []).map(challenge => ({
      id: challenge.id,
      name: challenge.name,
      solved: solvedChallengeIds.has(challenge.id),
      required: challenge.required || false,
      description: challenge.description
    }))
  }))

  // If there's an active challenge, show the workspace layout
  if (activeChallenge) {
    return (
      <DojoWorkspaceLayout
        dojo={{
          id: dojoId,
          name: dojo?.name || dojoId,
          description: dojo?.description
        }}
        modules={layoutModules}
        activeChallenge={activeChallenge}
        onChallengeStart={handleChallengeStart}
        onChallengeClose={handleChallengeClose}
      />
    )
  }

  const getDojoIcon = (dojo: any) => {
    // If dojo has an award with a belt, use the belt SVG
    if (dojo?.award?.belt && dojo.official) {
      return <img
        src={`/belt/${dojo.award.belt}.svg`}
        alt={`${dojo.award.belt} belt`}
        className="h-8 w-auto max-w-[72px]"
      />
    }

    // If dojo has an award with an emoji, use the emoji
    if (dojo?.award?.emoji) {
      return <span className="text-5xl">{dojo.award.emoji}</span>
    }

    // Fallback to name-based emojis
    const name = dojo?.name?.toLowerCase() || ''
    if (name.includes('fundamentals')) return <span className="text-5xl">💻</span>
    if (name.includes('linux')) return <span className="text-5xl">🐧</span>
    if (name.includes('program')) return <span className="text-5xl">🔤</span>
    if (name.includes('web')) return <span className="text-5xl">🌐</span>
    if (name.includes('crypto')) return <span className="text-5xl">🔐</span>
    if (name.includes('reverse')) return <span className="text-5xl">🔍</span>
    if (name.includes('pwn')) return <span className="text-5xl">💥</span>
    if (name.includes('forensics')) return <span className="text-5xl">🕵️</span>
    return <span className="text-5xl">🎯</span>
  }

  // Course overview page
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dojos
          </Button>
        </div>

        {/* Course Hero Section */}
        <div className="mb-12 relative">
          {/* Icon positioned top-right */}
          <div className="absolute top-0 right-0 flex items-center justify-center">
            {getDojoIcon(dojo)}
          </div>

          <div className="pr-16">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{dojo?.name || dojoId}</h1>
            <div className="flex items-center gap-3 mb-4">
              {dojo?.official && (
                <Badge variant="default">Official</Badge>
              )}
              <Badge variant="outline">
                {progressPercentage}% Complete
              </Badge>
              <Badge variant="secondary">
                {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
              </Badge>
            </div>

            {dojo?.description && (
              <div className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                <div className="relative">
                  <div
                    className={`transition-all duration-300 ${
                      !isDescriptionExpanded ? 'max-h-24 overflow-hidden' : ''
                    }`}
                  >
                    <Markdown className="text-lg">{dojo.description}</Markdown>
                  </div>

                  {!isDescriptionExpanded && dojo.description.length > 200 && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                  )}

                  {dojo.description.length > 200 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                    >
                      {isDescriptionExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Stats
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your Progress Card */}
            <Card className="relative overflow-hidden border-primary/20 hover:border-primary/40 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="relative pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Completion</span>
                    <span className="font-semibold text-primary">{progressPercentage}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-foreground">{solvedCount}</div>
                    <div className="text-xs text-muted-foreground">Solved</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-foreground">{totalChallenges}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-foreground">{modules.length}</div>
                    <div className="text-xs text-muted-foreground">Modules</div>
                  </div>
                </div>

                {/* Achievement Badges */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    🔥 {solvedCount > 0 ? 'Active' : 'Getting Started'}
                  </Badge>
                  {progressPercentage >= 25 && (
                    <Badge variant="outline" className="text-xs">⭐ 25% Complete</Badge>
                  )}
                  {progressPercentage >= 50 && (
                    <Badge variant="outline" className="text-xs">🌟 Half Way There</Badge>
                  )}
                  {progressPercentage >= 75 && (
                    <Badge variant="outline" className="text-xs">💫 Almost Done</Badge>
                  )}
                  {progressPercentage === 100 && (
                    <Badge variant="outline" className="text-xs">🏆 Master</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Preview Card */}
            <Card className="relative overflow-hidden hover:border-muted-foreground/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
              <CardHeader className="relative pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {/* Your Rank */}
                <div className="p-4 bg-accent/10 rounded-lg text-center">
                  <div className="text-sm text-muted-foreground mb-1">Your Rank</div>
                  <div className="text-3xl font-bold text-accent">-</div>
                  <div className="text-xs text-muted-foreground mt-1">Not ranked yet</div>
                </div>

                {/* Top Performers */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Top Performers</div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((rank) => (
                      <div key={rank} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                            {rank}
                          </div>
                          <span className="text-sm text-muted-foreground">-</span>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">- pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/leaderboard">View Full Leaderboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Course Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => {
              const moduleProgress = module.challenges ?
                module.challenges.filter(c => solvedChallengeIds.has(c.id)).length / module.challenges.length * 100 : 0

              return (
                <Card key={module.id} className="relative hover:shadow-md hover:border-muted-foreground/20 transition-all duration-200 group">
                  {/* Module number positioned top-right */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {index + 1}
                  </div>

                  <CardHeader className="pb-3 pr-16">
                    <CardTitle className="text-lg group-hover:text-foreground transition-colors mb-3">
                      {module.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.round(moduleProgress)}% Complete
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {module.challenges?.length || 0} challenges
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-muted-foreground font-medium">
                          {module.challenges?.filter(c => solvedChallengeIds.has(c.id)).length || 0} / {module.challenges?.length || 0}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>

                      {module.challenges && module.challenges.length > 0 && (
                        <Button
                          onClick={() => handleChallengeStart(dojoId, module.id, module.challenges[0].id)}
                          className="w-full mt-4"
                          variant={moduleProgress > 0 ? 'default' : 'outline'}
                        >
                          {moduleProgress > 0 ? 'Continue Module' : 'Start Module'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}