"use client"

import { useEffect, useState } from "react"

interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  condition: 'new' | 'like_new' | 'good' | 'acceptable' | 'poor';
  category: string;
  price?: number;
  listing_type: 'sell' | 'exchange' | 'donate';
  status: 'available' | 'reserved' | 'sold';
  image_url?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
  profiles?: {
    full_name: string;
    university: string;
  };
}

// Sample data for when database isn't set up yet
function getSampleBooks(): Book[] {
  return [
    {
      id: "1",
      user_id: "sample",
      title: "Introduction to Computer Science",
      author: "John Smith",
      description: "Great textbook for CS101. Barely used, excellent condition.",
      condition: "like_new" as const,
      category: "Computer Science",
      price: 45,
      listing_type: "sell" as const,
      status: "available" as const,
      image_url: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        full_name: "John Doe",
        university: "Sample University"
      }
    },
    {
      id: "2", 
      user_id: "sample",
      title: "Calculus: Early Transcendentals",
      author: "James Stewart",
      description: "Essential math textbook. Some highlighting but all pages intact.",
      condition: "good" as const,
      category: "Mathematics",
      price: 35,
      listing_type: "sell" as const,
      status: "available" as const,
      image_url: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        full_name: "Jane Smith",
        university: "Sample University"
      }
    },
    {
      id: "3",
      user_id: "sample", 
      title: "Biology: The Unity and Diversity of Life",
      author: "Cecie Starr",
      description: "Perfect for Bio 101. Available for exchange with Chemistry textbook.",
      condition: "good" as const,
      category: "Biology", 
      listing_type: "exchange" as const,
      status: "available" as const,
      image_url: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        full_name: "Mike Johnson",
        university: "Sample University"
      }
    },
    {
      id: "4",
      user_id: "sample",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald", 
      description: "Classic literature. Free to a good home!",
      condition: "acceptable" as const,
      category: "Literature",
      listing_type: "donate" as const,
      status: "available" as const,
      image_url: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        full_name: "Sarah Wilson",
        university: "Sample University"
      }
    }
  ]
}
import { BookCard } from "@/components/book-card"
import { MarketplaceFilters } from "@/components/marketplace-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function MarketplacePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [listingType, setListingType] = useState("all")
  const [condition, setCondition] = useState("all")

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [books, searchQuery, category, listingType, condition])

  const fetchBooks = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/books', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setBooks(data.books || [])
      } else {
        console.error("Error fetching books:", response.statusText)
        // Fallback to sample data if API fails
        setBooks(getSampleBooks())
      }
    } catch (error) {
      console.error("Error fetching books:", error)
      // Fallback to sample data if database isn't set up
      setBooks(getSampleBooks())
    } finally {
      setIsLoading(false)
    }
  }

  const filterBooks = () => {
    let filtered = [...books]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (book) => book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query),
      )
    }

    // Category filter
    if (category !== "all") {
      filtered = filtered.filter((book) => book.category === category)
    }

    // Listing type filter
    if (listingType !== "all") {
      filtered = filtered.filter((book) => book.listing_type === listingType)
    }

    // Condition filter
    if (condition !== "all") {
      filtered = filtered.filter((book) => book.condition === condition)
    }

    setFilteredBooks(filtered)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            BookSwap
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link href="/marketplace/new">
                <Plus className="mr-2 h-4 w-4" />
                List a Book
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book Marketplace</h1>
          <p className="text-muted-foreground">Browse and find textbooks from fellow students</p>
        </div>

        <div className="mb-8">
          <MarketplaceFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            category={category}
            onCategoryChange={setCategory}
            listingType={listingType}
            onListingTypeChange={setListingType}
            condition={condition}
            onConditionChange={setCondition}
          />
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No books found matching your criteria</p>
            <Button asChild>
              <Link href="/marketplace/new">List the first book</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
