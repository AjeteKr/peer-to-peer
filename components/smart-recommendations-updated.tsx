"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Book } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookCard } from "./book-card"
import { Sparkles, RefreshCw, TrendingUp, Clock } from "lucide-react"

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
      
      if (response.ok) {
        const books = await response.json()
        
        // Simple recommendation logic - split books into categories
        const allBooks = Array.isArray(books) ? books : []
        
        // Recommended books (available for exchange)
        const recommended = allBooks
          .filter(book => book.availability_type === 'exchange' && book.is_available)
          .slice(0, 6)
        
        // Trending books (recently updated)
        const trending = allBooks
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 6)
        
        // Recently added books
        const recent = allBooks
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 6)
        
        setRecommendations(recommended)
        setTrendingBooks(trending)
        setRecentlyAdded(recent)
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
      // Set empty arrays on error
      setRecommendations([])
      setTrendingBooks([])
      setRecentlyAdded([])
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentBooks = () => {
    switch (activeTab) {
      case 'trending':
        return trendingBooks
      case 'recent':
        return recentlyAdded
      default:
        return recommendations
    }
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'trending':
        return "Trending Books"
      case 'recent':
        return "Recently Added"
      default:
        return "Recommended for You"
    }
  }

  const getTabIcon = () => {
    switch (activeTab) {
      case 'trending':
        return <TrendingUp className="w-5 h-5" />
      case 'recent':
        return <Clock className="w-5 h-5" />
      default:
        return <Sparkles className="w-5 h-5" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Loading Recommendations...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentBooks = getCurrentBooks()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getTabIcon()}
            {getTabTitle()}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecommendations}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'recommended' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('recommended')}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Recommended
          </Button>
          <Button
            variant={activeTab === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('trending')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Trending
          </Button>
          <Button
            variant={activeTab === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('recent')}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Recent
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {currentBooks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No books found in this category.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adding some books to see recommendations!
            </p>
          </div>
        ) : (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {currentBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}