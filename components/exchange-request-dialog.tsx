"use client"

import type React from "react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"

interface ExchangeRequestDialogProps {
  bookId: string
  sellerId: string
  bookTitle: string
}

export function ExchangeRequestDialog({ bookId, sellerId, bookTitle }: ExchangeRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push("/auth/login")
        return
      }

      // Create exchange request via API
      const response = await fetch('/api/exchanges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          book_id: bookId,
          seller_id: sellerId,
          message: message
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create exchange request')
      }

      setOpen(false)
      setMessage("")
      
      // Show success message or redirect
      router.push("/dashboard/messages")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <MessageSquare className="mr-2 h-5 w-5" />
          Contact Seller
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact Seller</DialogTitle>
          <DialogDescription>Send a message about &quot;{bookTitle}&quot;</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Hi, I'm interested in this book..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Sending..." : "Send Message"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
