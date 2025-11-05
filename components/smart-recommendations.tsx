"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Book } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, RefreshCw, TrendingUp, Clock, BookOpen, Star } from "lucide-react"

interface SmartRecommendationsProps {
  userId?: string
}

export function SmartRecommendations({ userId }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Book[]>([])
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([])
  const [recentlyAdded, setRecentlyAdded] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'recommended' | 'trending' | 'recent'>('recommended')

  useEffect(() => {
    fetchRecommendations()
  }, [userId])

  const fetchRecommendations = async () => {
    setIsLoading(true)

    try {
      // Fetch available books from our SQL Server API
      const response = await fetch('/api/books')
      if (!response.ok) {
        throw new Error('Failed to fetch books')
      }
      
      const books = await response.json()
      
      // Filter available books
      const availableBooks = books.filter((book: Book) => book.status === 'available')
      
      // Simple recommendation logic - can be enhanced later
      const shuffled = availableBooks.sort(() => 0.5 - Math.random())
      
      setRecommendations(shuffled.slice(0, 6))
      setTrendingBooks(shuffled.slice(6, 12))
      setRecentlyAdded(shuffled.slice(12, 18))
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentBooks = () => {
    switch (activeTab) {
      case 'recommended': return recommendations
      case 'trending': return trendingBooks
      case 'recent': return recentlyAdded
      default: return recommendations
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'recommended': return <Sparkles className="h-4 w-4" />
      case 'trending': return <TrendingUp className="h-4 w-4" />
      case 'recent': return <Clock className="h-4 w-4" />
      default: return <Sparkles className="h-4 w-4" />
    }
  }

  const tabs = [
    { key: 'recommended', label: 'For You', count: recommendations.length },
    { key: 'trending', label: 'Trending', count: trendingBooks.length },
    { key: 'recent', label: 'Just Added', count: recentlyAdded.length }
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Discover Books
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRecommendations}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mt-4">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all relative ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                {getTabIcon(tab.key)}
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.key
                      ? 'bg-primary-foreground/20'
                      : 'bg-primary/20'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg aspect-3/4 mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {getCurrentBooks().map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-8 w-8 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{book.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">by {book.author}</p>
                      <div className="flex gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {book.condition || 'Good'}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {book.listing_type || 'exchange'}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => window.location.href = `/marketplace/${book.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && getCurrentBooks().length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground">
              Start listing or browsing books to get personalized recommendations!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}