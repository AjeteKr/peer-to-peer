"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Book } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Share2, BookOpen, Eye, MapPin } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface EnhancedBookCardProps {
  book: Book
  onLike?: (bookId: string) => void
  onShare?: (book: Book) => void
  isLiked?: boolean
}

export function EnhancedBookCard({ book, onLike, onShare, isLiked = false }: EnhancedBookCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const conditionColors = {
    new: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200",
    like_new: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200",
    good: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200",
    acceptable: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200",
    poor: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200",
  }

  const listingTypeStyles = {
    sell: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    exchange: "bg-blue-500/10 text-blue-700 border-blue-200",
    donate: "bg-purple-500/10 text-purple-700 border-purple-200",
  }

  const listingTypeLabels = {
    sell: "💰 For Sale",
    exchange: "🔄 Exchange",
    donate: "🎁 Free",
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 group">
        <CardContent className="p-4">
          {/* Book Image with Interactive Overlay */}
          <div className="relative aspect-3/4 bg-muted rounded-lg mb-3 overflow-hidden">
            {book.image_url ? (
              <>
                <img 
                  src={book.image_url || "/placeholder.svg"} 
                  alt={book.title} 
                  className={cn(
                    "w-full h-full object-cover transition-all duration-500",
                    imageLoaded ? "scale-100 blur-0" : "scale-110 blur-sm"
                  )}
                  onLoad={() => setImageLoaded(true)}
                />
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Button size="sm" variant="secondary" className="bg-white/90 text-black hover:bg-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.15 }}
                      >
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className={cn(
                            "bg-white/90 hover:bg-white transition-colors",
                            isLiked ? "text-red-500" : "text-black"
                          )}
                          onClick={(e) => {
                            e.preventDefault()
                            onLike?.(book.id)
                          }}
                        >
                          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                        </Button>
                      </motion.div>
                      
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="bg-white/90 text-black hover:bg-white"
                          onClick={(e) => {
                            e.preventDefault()
                            onShare?.(book)
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            {/* Status Indicators */}
            <div className="absolute top-2 left-2">
              <Badge 
                variant="secondary" 
                className={cn("text-xs", listingTypeStyles[book.listing_type])}
              >
                {listingTypeLabels[book.listing_type]}
              </Badge>
            </div>

            <div className="absolute top-2 right-2">
              <Badge 
                variant="outline" 
                className={cn("text-xs border", conditionColors[book.condition])}
              >
                {book.condition.replace("_", " ")}
              </Badge>
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold line-clamp-2 text-balance group-hover:text-primary transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
            </div>

            {/* University & Location */}
            {book.profiles?.university && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{book.profiles.university}</span>
              </div>
            )}

            {/* Book Category */}
            <Badge variant="outline" className="text-xs">
              {book.category}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            {book.listing_type === "sell" && book.price ? (
              <motion.div
                animate={{ scale: isHovered ? 1.1 : 1 }}
                className="text-lg font-bold text-primary"
              >
                ${book.price}
              </motion.div>
            ) : book.listing_type === "exchange" ? (
              <span className="text-sm font-medium text-blue-600">Available for exchange</span>
            ) : (
              <span className="text-sm font-medium text-purple-600">Free to good home</span>
            )}

            <Link href={`/marketplace/${book.id}`}>
              <Button size="sm" className="ml-2">
                View Details
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}