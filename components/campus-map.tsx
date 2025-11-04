"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Clock, Users } from "lucide-react"
import type { Book } from "@/lib/types"

interface BookLocation {
  id: string
  book: Book
  meetupSpot: string
  distance?: number
  availableTime?: string
}

interface CampusMapProps {
  userLocation?: { lat: number; lng: number }
  nearbyBooks: BookLocation[]
}

export function CampusMap({ userLocation, nearbyBooks }: CampusMapProps) {
  const [selectedBook, setSelectedBook] = useState<BookLocation | null>(null)
  const [mapMode, setMapMode] = useState<'list' | 'map'>('list')

  // Popular meetup spots on campus
  const meetupSpots = [
    { id: '1', name: 'Library - Main Entrance', icon: '📚', popular: true },
    { id: '2', name: 'Student Center', icon: '🏢', popular: true },
    { id: '3', name: 'Coffee Shop', icon: '☕', popular: false },
    { id: '4', name: 'Quad Area', icon: '🌳', popular: true },
    { id: '5', name: 'Bookstore', icon: '📖', popular: false },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Campus Exchange Map
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={mapMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMapMode('list')}
            >
              List
            </Button>
            <Button 
              variant={mapMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMapMode('map')}
            >
              Map
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {mapMode === 'list' ? (
          <div className="space-y-4">
            {/* Popular Meetup Spots */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Popular Exchange Spots
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {meetupSpots.map((spot) => (
                  <motion.div
                    key={spot.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      spot.popular 
                        ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{spot.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{spot.name}</div>
                        {spot.popular && (
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Nearby Books */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Books Near You
              </h3>
              <div className="space-y-3">
                {nearbyBooks.slice(0, 5).map((bookLocation) => (
                  <motion.div
                    key={bookLocation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedBook(bookLocation)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-20 bg-muted rounded shrink-0 flex items-center justify-center">
                        {bookLocation.book.image_url ? (
                          <img 
                            src={bookLocation.book.image_url} 
                            alt={bookLocation.book.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-2xl">📚</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{bookLocation.book.title}</h4>
                        <p className="text-sm text-muted-foreground">{bookLocation.book.author}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-muted-foreground">
                            {bookLocation.meetupSpot}
                          </span>
                          {bookLocation.distance && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-green-600">
                                {bookLocation.distance}m away
                              </span>
                            </>
                          )}
                        </div>
                        {bookLocation.availableTime && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-orange-500" />
                            <span className="text-xs text-muted-foreground">
                              Available: {bookLocation.availableTime}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {bookLocation.book.listing_type === 'sell' && bookLocation.book.price && (
                          <div className="font-semibold text-primary">${bookLocation.book.price}</div>
                        )}
                        <Badge 
                          variant="outline" 
                          className={
                            bookLocation.book.listing_type === 'donate' 
                              ? 'border-purple-200 text-purple-700' 
                              : bookLocation.book.listing_type === 'exchange'
                              ? 'border-blue-200 text-blue-700'
                              : 'border-green-200 text-green-700'
                          }
                        >
                          {bookLocation.book.listing_type === 'donate' ? '🎁 Free' :
                           bookLocation.book.listing_type === 'exchange' ? '🔄 Exchange' : '💰 Sale'}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Interactive Campus Map View */
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold">Interactive Campus Map</h3>
                <p className="text-sm text-muted-foreground">
                  Coming soon: Real-time map showing book locations and meetup spots
                </p>
              </div>
              <Button variant="outline">
                Enable Location Services
              </Button>
            </div>
          </div>
        )}

        {/* Selected Book Details */}
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 border-2 border-primary/20 rounded-lg bg-primary/5"
          >
            <h4 className="font-semibold mb-2">Selected Book</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-16 bg-muted rounded">
                {selectedBook.book.image_url && (
                  <img 
                    src={selectedBook.book.image_url} 
                    alt={selectedBook.book.title}
                    className="w-full h-full object-cover rounded"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{selectedBook.book.title}</div>
                <div className="text-sm text-muted-foreground">{selectedBook.book.author}</div>
                <div className="text-sm text-muted-foreground">📍 {selectedBook.meetupSpot}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Contact Seller</Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedBook(null)}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}