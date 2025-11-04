export interface Book {
  id: string
  user_id: string
  title: string
  author: string
  isbn?: string
  description?: string
  condition: "new" | "like_new" | "good" | "acceptable" | "poor"
  category: string
  price?: number
  listing_type: "sell" | "exchange" | "donate"
  status: "available" | "reserved" | "sold"
  image_url?: string
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    university: string
  }
}

export interface Profile {
  id: string
  full_name: string
  university: string
  student_id?: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Exchange {
  id: string
  book_id: string
  seller_id: string
  buyer_id: string
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  message?: string
  created_at: string
  updated_at: string
  books?: Book
  seller_profile?: Profile
  buyer_profile?: Profile
}

export interface UserStats {
  level: number
  experience: number
  books_shared: number
  books_received: number
  reputation_score: number
  badges: Badge[]
  streak_days: number
  total_saved_money: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked_at?: string
}

export interface Message {
  id: string
  exchange_id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
  sender_profile?: Profile
}
