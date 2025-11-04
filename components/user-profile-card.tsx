"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Gift, Target } from "lucide-react"
import type { UserStats } from "@/lib/gamification"

interface UserProfileCardProps {
  stats: UserStats
}

export function UserProfileCard({ stats }: UserProfileCardProps) {
  const progressToNextLevel = ((stats.experience % 100) / 100) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Level {stats.level} Scholar
            </CardTitle>
            <Badge variant="secondary" className="bg-linear-to-r from-primary to-secondary text-primary-foreground">
              {stats.reputation_score} Rep
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative">
          {/* Experience Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {stats.level + 1}</span>
              <span>{stats.experience % 100}/100 XP</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-3 bg-muted/50 rounded-lg"
            >
              <Gift className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">{stats.books_shared}</div>
              <div className="text-sm text-muted-foreground">Books Shared</div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-3 bg-muted/50 rounded-lg"
            >
              <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">{stats.books_received}</div>
              <div className="text-sm text-muted-foreground">Books Received</div>
            </motion.div>
          </div>

          {/* Recent Badges */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Recent Achievements
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats.badges.slice(0, 3).map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge 
                    variant="outline" 
                    className={`${getBadgeColor(badge.rarity)} border-2`}
                  >
                    {badge.icon} {badge.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Streak Counter */}
          {stats.streak_days > 0 && (
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-linear-to-r from-orange-500/10 to-red-500/10 p-3 rounded-lg border border-orange-200"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="font-semibold">{stats.streak_days} day streak!</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function getBadgeColor(rarity: string) {
  switch (rarity) {
    case 'legendary': return 'border-purple-500 bg-purple-500/10 text-purple-700'
    case 'epic': return 'border-blue-500 bg-blue-500/10 text-blue-700'
    case 'rare': return 'border-green-500 bg-green-500/10 text-green-700'
    default: return 'border-gray-500 bg-gray-500/10 text-gray-700'
  }
}