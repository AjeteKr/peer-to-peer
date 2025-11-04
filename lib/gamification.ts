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

export const BADGES = {
  FIRST_SHARE: {
    id: 'first_share',
    name: 'First Steps',
    description: 'Listed your first book',
    icon: '📚',
    rarity: 'common' as const
  },
  GENEROUS_GIVER: {
    id: 'generous_giver',
    name: 'Generous Giver',
    description: 'Donated 5 books for free',
    icon: '💝',
    rarity: 'rare' as const
  },
  BOOK_HUNTER: {
    id: 'book_hunter',
    name: 'Book Hunter',
    description: 'Successfully exchanged 10 books',
    icon: '🎯',
    rarity: 'epic' as const
  },
  ECO_WARRIOR: {
    id: 'eco_warrior',
    name: 'Eco Warrior',
    description: 'Saved 50+ books from waste',
    icon: '🌱',
    rarity: 'legendary' as const
  },
  SPEED_EXCHANGER: {
    id: 'speed_exchanger',
    name: 'Speed Exchanger',
    description: 'Completed exchange within 24 hours',
    icon: '⚡',
    rarity: 'rare' as const
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Connected with 20+ students',
    icon: '🦋',
    rarity: 'epic' as const
  }
} as const

export function calculateLevel(experience: number): number {
  return Math.floor(Math.sqrt(experience / 100)) + 1
}

export function getExperienceForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100
}

export function calculateExperienceGain(action: string): number {
  const experienceMap: Record<string, number> = {
    'list_book': 10,
    'successful_exchange': 25,
    'donate_book': 15,
    'first_review': 20,
    'complete_profile': 30,
    'daily_login': 5,
    'recommend_friend': 50
  }
  
  return experienceMap[action] || 0
}