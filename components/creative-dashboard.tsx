"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import type { Book, UserStats } from "@/lib/types"
import { UserProfileCard } from "@/components/user-profile-card"
import { SmartRecommendations } from "@/components/smart-recommendations"
import { CampusMap } from "@/components/campus-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  TrendingUp, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Trophy,
  Target,
  Gift,
  Zap
} from "lucide-react"
import Link from "next/link"

export default function CreativeDashboard() {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recentBooks, setRecentBooks] = useState<Book[]>([])
  const [nearbyBooks, setNearbyBooks] = useState<any[]>([])
  const [quickStats, setQuickStats] = useState({
    activeListings: 0,
    completedExchanges: 0,
    totalViews: 0,
    totalLikes: 0
  })
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setCurrentUserId(user.id)

      // Mock user stats (replace with real data)
      setUserStats({
        level: 5,
        experience: 2350,
        books_shared: 12,
        books_received: 8,
        reputation_score: 4.7,
        badges: [
          { id: '1', name: 'First Steps', description: 'Listed first book', icon: '📚', rarity: 'common' },
          { id: '2', name: 'Social Butterfly', description: 'Connected with 20+ students', icon: '🦋', rarity: 'epic' },
          { id: '3', name: 'Speed Exchanger', description: 'Quick exchange', icon: '⚡', rarity: 'rare' }
        ],
        streak_days: 7,
        total_saved_money: 245
      })

      // Try to fetch user's books (graceful fallback if tables don't exist)
      let books: any[] = []
      try {
        const { data: booksData, error } = await supabase
          .from("books")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error && (error.code === 'PGRST116' || error.message?.includes('relation'))) {
          console.log("Database tables not set up yet. Using sample data for dashboard.")
          books = []
        } else if (error) {
          throw error
        } else {
          books = booksData || []
        }
      } catch (error) {
        console.log("Using sample data for dashboard:", error)
        books = []
      }

      setRecentBooks(books)

      // Calculate quick stats (using sample data if database not set up)
      const activeBooks = books?.filter(b => b.status === 'available').length || 0
      setQuickStats({
        activeListings: activeBooks || 2, // Show sample data if no books
        completedExchanges: books?.filter(b => b.status === 'sold').length || 1,
        totalViews: Math.floor(Math.random() * 500) + 100, // Mock data
        totalLikes: Math.floor(Math.random() * 50) + 10 // Mock data
      })

      // Mock nearby books data
      setNearbyBooks([
        {
          id: '1',
          book: books?.[0] || { title: 'Sample Book', author: 'Author', listing_type: 'sell', price: 25 },
          meetupSpot: 'Library - Main Entrance',
          distance: 150,
          availableTime: 'Today 2-4 PM'
        }
      ])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const quickActions = [
    {
      title: 'List New Book',
      description: 'Share or sell your textbooks',
      icon: <Plus className="h-5 w-5" />,
      href: '/marketplace/new',
      color: 'bg-blue-500 hover:bg-blue-600',
      badge: '+10 XP'
    },
    {
      title: 'Browse Books',
      description: 'Find books you need',
      icon: <BookOpen className="h-5 w-5" />,
      href: '/marketplace',
      color: 'bg-green-500 hover:bg-green-600',
      badge: 'Hot'
    },
    {
      title: 'My Messages',
      description: 'Check exchange requests',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/dashboard/messages',
      color: 'bg-purple-500 hover:bg-purple-600',
      badge: '3 new'
    },
    {
      title: 'Find Students',
      description: 'Connect with peers',
      icon: <Users className="h-5 w-5" />,
      href: '/students',
      color: 'bg-orange-500 hover:bg-orange-600',
      badge: 'Beta'
    }
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Welcome back! 📚
            </h1>
            <p className="text-muted-foreground">
              Ready to discover amazing books today?
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button asChild className="bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
              <Link href="/marketplace/new">
                <Plus className="mr-2 h-4 w-4" />
                List Book
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href={action.href}>
                <Card className="relative overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className={`${action.color} text-white p-3 rounded-lg mb-3 transition-colors group-hover:scale-110 transform duration-200`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                    {action.badge && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Profile & Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* User Profile Card */}
            {userStats && <UserProfileCard stats={userStats} />}
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold text-blue-600">{quickStats.activeListings}</div>
                    <div className="text-xs text-muted-foreground">Active Listings</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold text-green-600">{quickStats.completedExchanges}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold text-purple-600">{quickStats.totalViews}</div>
                    <div className="text-xs text-muted-foreground">Profile Views</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Gift className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold text-orange-600">{quickStats.totalLikes}</div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Recommendations & Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            
            {/* Tabbed Content */}
            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recommendations" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Discover
                </TabsTrigger>
                <TabsTrigger value="campus" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Campus
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Activity
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="recommendations" className="mt-6">
                {currentUserId && <SmartRecommendations userId={currentUserId} />}
              </TabsContent>
              
              <TabsContent value="campus" className="mt-6">
                <CampusMap nearbyBooks={nearbyBooks} />
              </TabsContent>
              
              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentBooks.slice(0, 3).map((book, index) => (
                        <motion.div
                          key={book.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="w-12 h-16 bg-primary/10 rounded flex items-center justify-center">
                            {book.image_url ? (
                              <img src={book.image_url} alt={book.title} className="w-full h-full object-cover rounded" />
                            ) : (
                              <BookOpen className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{book.title}</h4>
                            <p className="text-xs text-muted-foreground">{book.author}</p>
                            <Badge variant="outline" className="mt-1">
                              {book.status === 'available' ? 'Active' : 'Sold'}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}