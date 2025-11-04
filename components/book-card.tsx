import type { Book } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen } from "lucide-react"

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  const conditionColors = {
    new: "bg-green-500/10 text-green-700 dark:text-green-400",
    like_new: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    good: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    acceptable: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    poor: "bg-red-500/10 text-red-700 dark:text-red-400",
  }

  const listingTypeLabels = {
    sell: "For Sale",
    exchange: "For Exchange",
    donate: "Free",
  }

  return (
    <Link href={`/marketplace/${book.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="aspect-3/4 bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden">
            {book.image_url ? (
              <img src={book.image_url || "/placeholder.svg"} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold line-clamp-2 text-balance">{book.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={conditionColors[book.condition]}>
                {book.condition.replace("_", " ")}
              </Badge>
              <Badge variant="outline">{listingTypeLabels[book.listing_type]}</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            {book.listing_type === "sell" && book.price ? (
              <span className="text-lg font-bold">${book.price}</span>
            ) : (
              <span className="text-sm text-muted-foreground">{listingTypeLabels[book.listing_type]}</span>
            )}
            {book.profiles && <span className="text-xs text-muted-foreground">{book.profiles.university}</span>}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
