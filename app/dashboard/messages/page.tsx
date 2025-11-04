"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface Exchange {
  id: string;
  book_id: string;
  seller_id: string;
  buyer_id: string;
  status: string;
  message?: string;
  created_at: string;
  updated_at: string;
  books?: {
    id: string;
    title: string;
    author: string;
    image_url?: string;
  };
  seller_profile?: {
    id: string;
    full_name: string;
    university: string;
  };
  buyer_profile?: {
    id: string;
    full_name: string;
    university: string;
  };
}

interface Message {
  id: string;
  exchange_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MessagesPage() {
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchExchanges()
  }, [])

  useEffect(() => {
    if (selectedExchange) {
      fetchMessages(selectedExchange.id)
    }
  }, [selectedExchange])

  const fetchExchanges = async () => {
    setIsLoading(true)

    try {
      // Get current user from localStorage
      const userData = localStorage.getItem('user')
      if (!userData) {
        console.log("No authenticated user")
        return
      }

      const user = JSON.parse(userData)
      setCurrentUserId(user.id)

      const response = await fetch('/api/exchanges', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setExchanges(data.exchanges || [])
        if (data.exchanges && data.exchanges.length > 0 && !selectedExchange) {
          setSelectedExchange(data.exchanges[0])
        }
      } else {
        console.error("Error fetching exchanges:", response.statusText)
        setExchanges([])
      }
    } catch (error) {
      console.error("Error fetching exchanges:", error)
      // Fallback to empty state if database isn't set up
      setExchanges([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (exchangeId: string) => {
    try {
      const response = await fetch(`/api/messages?exchange_id=${exchangeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        console.error("Error fetching messages:", response.statusText)
        setMessages([])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedExchange || !currentUserId) return

    setIsSending(true)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exchange_id: selectedExchange.id,
          content: newMessage,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages(selectedExchange.id)
      } else {
        const data = await response.json()
        console.error("Error sending message:", data.error)
        alert("Unable to send message: " + (data.error || "Please try again"))
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Unable to send message. Please check your connection and try again.")
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (exchanges.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with other students about book exchanges</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                When you contact sellers or receive inquiries about your books, conversations will appear here.
              </p>
              <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                💡 Tip: If the database isn't set up yet, run the SQL setup script to enable messaging features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with other students about book exchanges</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {exchanges.map((exchange) => {
                const otherUser =
                  exchange.seller_id === currentUserId ? exchange.buyer_profile : exchange.seller_profile

                return (
                  <button
                    key={exchange.id}
                    onClick={() => setSelectedExchange(exchange)}
                    className={cn(
                      "w-full text-left p-4 hover:bg-muted transition-colors border-b",
                      selectedExchange?.id === exchange.id && "bg-muted",
                    )}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm line-clamp-1">{otherUser?.full_name}</p>
                      <Badge
                        variant={
                          exchange.status === "pending"
                            ? "outline"
                            : exchange.status === "accepted"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {exchange.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{exchange.books?.title}</p>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedExchange?.books?.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedExchange?.seller_id === currentUserId
                    ? selectedExchange?.buyer_profile?.full_name
                    : selectedExchange?.seller_profile?.full_name}
                </p>
              </div>
              <Badge
                variant={
                  selectedExchange?.status === "pending"
                    ? "outline"
                    : selectedExchange?.status === "accepted"
                      ? "default"
                      : "secondary"
                }
              >
                {selectedExchange?.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.sender_id === currentUserId
              return (
                <div key={message.id} className={cn("flex", isCurrentUser ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg p-3",
                      isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>

          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isSending}
              />
              <Button type="submit" size="icon" disabled={isSending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
