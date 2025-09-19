import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Award } from 'lucide-react'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top hackers across all dojos
          </p>
        </div>

        {/* Top 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-yellow-500/20">
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <CardTitle className="text-xl">1st Place</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold mb-1">-</div>
              <div className="text-sm text-muted-foreground">0 points</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-400/20">
            <CardHeader className="text-center">
              <Medal className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <CardTitle className="text-xl">2nd Place</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold mb-1">-</div>
              <div className="text-sm text-muted-foreground">0 points</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-600/20">
            <CardHeader className="text-center">
              <Award className="h-12 w-12 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-xl">3rd Place</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold mb-1">-</div>
              <div className="text-sm text-muted-foreground">0 points</div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon */}
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Leaderboard Coming Soon</h2>
            <p className="text-muted-foreground">
              Track your progress and compete with other hackers
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}