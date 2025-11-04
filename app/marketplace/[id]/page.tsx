import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, User, Calendar } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ExchangeRequestDialog } from "@/components/exchange-request-dialog"

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: book, error } = await supabase
    .from("books")
    .select(`
      *,
      profiles (
        full_name,
        university,
        phone
      )
    `)
    .eq("id", id)
    .single()

  if (error || !book) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = user?.id === book.user_id

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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/marketplace" className="text-2xl font-bold">
            BookSwap
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Book Image */}
          <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {book.image_url ? (
              <img src={book.image_url || "/placeholder.svg"} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="h-24 w-24 text-muted-foreground" />
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-balance">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{book.author}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className={conditionColors[book.condition as keyof typeof conditionColors]}>
                  {book.condition.replace("_", " ")}
                </Badge>
                <Badge variant="outline">
                  {listingTypeLabels[book.listing_type as keyof typeof listingTypeLabels]}
                </Badge>
                <Badge variant="outline">{book.category}</Badge>
              </div>
            </div>

            {book.listing_type === "sell" && book.price && (
              <div>
                <p className="text-3xl font-bold">${book.price}</p>
              </div>
            )}

            {book.isbn && (
              <div>
                <p className="text-sm text-muted-foreground">ISBN</p>
                <p className="font-mono">{book.isbn}</p>
              </div>
            )}

            {book.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground">{book.description}</p>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{book.profiles?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">University</p>
                  <p className="font-medium">{book.profiles?.university}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Listed {new Date(book.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            {!isOwner && user && (
              <ExchangeRequestDialog bookId={book.id} sellerId={book.user_id} bookTitle={book.title} />
            )}

            {isOwner && (
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 bg-transparent">
                  Edit Listing
                </Button>
                <Button variant="destructive" className="flex-1">
                  Delete Listing
                </Button>
              </div>
            )}

            {!user && (
              <Card>
                <CardHeader>
                  <CardTitle>Interested in this book?</CardTitle>
                  <CardDescription>Sign in to contact the seller</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
