import { executeQuery, executeTransaction } from './connection';

// Business Logic Service Layer

export interface BookService {
  createBook(bookData: CreateBookData, userId: string): Promise<BookResult>;
  updateBook(bookId: string, updates: Partial<CreateBookData>, userId: string): Promise<BookResult>;
  deleteBook(bookId: string, userId: string): Promise<{ success: boolean; error?: string }>;
  getBooksByUser(userId: string): Promise<Book[]>;
  searchBooks(filters: BookFilters): Promise<PaginatedBooks>;
  getBookDetails(bookId: string): Promise<Book | null>;
  incrementViews(bookId: string): Promise<void>;
}

export interface ExchangeService {
  createExchange(data: CreateExchangeData): Promise<ExchangeResult>;
  updateExchangeStatus(exchangeId: string, status: ExchangeStatus, userId: string): Promise<ExchangeResult>;
  getUserExchanges(userId: string, type?: 'buying' | 'selling'): Promise<Exchange[]>;
  completeExchange(exchangeId: string, rating: number, feedback: string, userId: string): Promise<ExchangeResult>;
}

export interface UserService {
  updateProfile(userId: string, updates: ProfileUpdates): Promise<UserResult>;
  getUserStats(userId: string): Promise<UserStats>;
  updateUserXP(userId: string, xpGain: number, action: string): Promise<void>;
  awardBadge(userId: string, badgeId: string): Promise<void>;
  getUserBadges(userId: string): Promise<Badge[]>;
}

// Types
interface CreateBookData {
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  condition: 'new' | 'like_new' | 'good' | 'acceptable' | 'poor';
  category: string;
  price?: number;
  listing_type: 'sell' | 'exchange' | 'donate';
  location?: string;
  image_url?: string;
}

interface BookFilters {
  category?: string;
  condition?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  university?: string;
  page?: number;
  limit?: number;
}

interface CreateExchangeData {
  book_id: string;
  buyer_id: string;
  message?: string;
  meeting_location?: string;
  meeting_time?: Date;
}

interface ProfileUpdates {
  full_name?: string;
  university?: string;
  student_id?: string;
  phone?: string;
  avatar_url?: string;
}

type ExchangeStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  condition: string;
  category: string;
  price?: number;
  listing_type: string;
  status: string;
  image_url?: string;
  location?: string;
  views_count: number;
  created_at: Date;
  updated_at: Date;
  user_name?: string;
  user_avatar?: string;
  user_rating?: number;
}

interface Exchange {
  id: string;
  book_id: string;
  seller_id: string;
  buyer_id: string;
  status: ExchangeStatus;
  message?: string;
  meeting_location?: string;
  meeting_time?: Date;
  created_at: Date;
  updated_at: Date;
  book_title?: string;
  book_author?: string;
  book_image_url?: string;
  seller_name?: string;
  buyer_name?: string;
}

interface UserStats {
  experience_points: number;
  level_number: number;
  books_listed: number;
  books_sold: number;
  books_bought: number;
  successful_exchanges: number;
  average_rating: number;
  streak_days: number;
  unread_messages: number;
  pending_exchanges: number;
}

interface Badge {
  id: string;
  badge_id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  badge_rarity: string;
  earned_at: Date;
}

interface BookResult {
  book?: Book;
  error?: string;
}

interface ExchangeResult {
  exchange?: Exchange;
  error?: string;
}

interface UserResult {
  user?: any;
  error?: string;
}

interface PaginatedBooks {
  books: Book[];
  total: number;
  page: number;
  pages: number;
}

// Book Service Implementation
export class BookServiceImpl implements BookService {
  async createBook(bookData: CreateBookData, userId: string): Promise<BookResult> {
    try {
      const bookId = crypto.randomUUID();

      await executeQuery(
        `INSERT INTO books (
          id, user_id, title, author, isbn, description, condition, 
          category, price, listing_type, location, image_url, created_at, updated_at
        ) VALUES (
          @id, @userId, @title, @author, @isbn, @description, @condition,
          @category, @price, @listingType, @location, @imageUrl, @createdAt, @updatedAt
        )`,
        {
          id: bookId,
          userId,
          title: bookData.title,
          author: bookData.author,
          isbn: bookData.isbn || null,
          description: bookData.description || null,
          condition: bookData.condition,
          category: bookData.category,
          price: bookData.price || null,
          listingType: bookData.listing_type,
          location: bookData.location || null,
          imageUrl: bookData.image_url || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );

      // Award XP for listing a book
      await this.updateUserStats(userId, 'book_listed');

      // Log activity
      await executeQuery(
        `INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, created_at)
         VALUES (@userId, 'book_created', 'book', @bookId, @details, @createdAt)`,
        {
          userId,
          bookId,
          details: `Listed book: ${bookData.title}`,
          createdAt: new Date()
        }
      );

      const book = await this.getBookDetails(bookId);
      return { book: book || undefined };

    } catch (error) {
      console.error('Create book error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to create book' };
    }
  }

  async updateBook(bookId: string, updates: Partial<CreateBookData>, userId: string): Promise<BookResult> {
    try {
      // Check ownership
      const books = await executeQuery<{ user_id: string }>(
        'SELECT user_id FROM books WHERE id = @bookId',
        { bookId }
      );

      if (books.length === 0) {
        return { error: 'Book not found' };
      }

      if (books[0].user_id !== userId) {
        return { error: 'Unauthorized' };
      }

      // Build dynamic update query
      const updateFields = Object.keys(updates).map(key => `${key} = @${key}`);
      if (updateFields.length === 0) {
        return { error: 'No updates provided' };
      }

      const query = `UPDATE books SET ${updateFields.join(', ')}, updated_at = @updatedAt WHERE id = @bookId`;
      
      await executeQuery(query, {
        ...updates,
        bookId,
        updatedAt: new Date()
      });

      const book = await this.getBookDetails(bookId);
      return { book: book || undefined };

    } catch (error) {
      console.error('Update book error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to update book' };
    }
  }

  async deleteBook(bookId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check ownership and no active exchanges
      const checks = await executeQuery<{ user_id: string; active_exchanges: number }>(
        `SELECT 
          b.user_id,
          COALESCE(
            (SELECT COUNT(*) FROM exchanges e WHERE e.book_id = b.id AND e.status IN ('pending', 'accepted')), 
            0
          ) as active_exchanges
         FROM books b WHERE b.id = @bookId`,
        { bookId }
      );

      if (checks.length === 0) {
        return { success: false, error: 'Book not found' };
      }

      const { user_id, active_exchanges } = checks[0];

      if (user_id !== userId) {
        return { success: false, error: 'Unauthorized' };
      }

      if (active_exchanges > 0) {
        return { success: false, error: 'Cannot delete book with active exchanges' };
      }

      await executeQuery('DELETE FROM books WHERE id = @bookId', { bookId });

      return { success: true };

    } catch (error) {
      console.error('Delete book error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete book' };
    }
  }

  async getBooksByUser(userId: string): Promise<Book[]> {
    try {
      return await executeQuery<Book>(
        `SELECT 
          b.*,
          u.full_name as user_name,
          u.avatar_url as user_avatar,
          COALESCE(AVG(CAST(br.rating as FLOAT)), 0) as user_rating
         FROM books b
         INNER JOIN users u ON b.user_id = u.id
         LEFT JOIN book_reviews br ON b.id = br.book_id
         WHERE b.user_id = @userId
         GROUP BY b.id, b.user_id, b.title, b.author, b.isbn, b.description, 
                  b.condition, b.category, b.price, b.listing_type, b.status,
                  b.image_url, b.location, b.views_count, b.is_featured,
                  b.expires_at, b.created_at, b.updated_at, u.full_name, u.avatar_url
         ORDER BY b.created_at DESC`,
        { userId }
      );
    } catch (error) {
      console.error('Get user books error:', error);
      return [];
    }
  }

  async searchBooks(filters: BookFilters): Promise<PaginatedBooks> {
    try {
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 12, 50); // Max 50 items per page
      const offset = (page - 1) * limit;

      let whereConditions = ['b.status = @status'];
      const params: any = { status: 'available' };

      if (filters.category) {
        whereConditions.push('b.category = @category');
        params.category = filters.category;
      }

      if (filters.condition) {
        whereConditions.push('b.condition = @condition');
        params.condition = filters.condition;
      }

      if (filters.listing_type) {
        whereConditions.push('b.listing_type = @listingType');
        params.listingType = filters.listing_type;
      }

      if (filters.min_price) {
        whereConditions.push('b.price >= @minPrice');
        params.minPrice = filters.min_price;
      }

      if (filters.max_price) {
        whereConditions.push('b.price <= @maxPrice');
        params.maxPrice = filters.max_price;
      }

      if (filters.search) {
        whereConditions.push('(b.title LIKE @search OR b.author LIKE @search OR b.description LIKE @search)');
        params.search = `%${filters.search}%`;
      }

      if (filters.university) {
        whereConditions.push('u.university = @university');
        params.university = filters.university;
      }

      const whereClause = whereConditions.join(' AND ');

      // Get books
      const books = await executeQuery<Book>(
        `SELECT 
          b.*,
          u.full_name as user_name,
          u.avatar_url as user_avatar,
          COALESCE(AVG(CAST(br.rating as FLOAT)), 0) as user_rating
         FROM books b
         INNER JOIN users u ON b.user_id = u.id
         LEFT JOIN book_reviews br ON b.id = br.book_id
         WHERE ${whereClause}
         GROUP BY b.id, b.user_id, b.title, b.author, b.isbn, b.description, 
                  b.condition, b.category, b.price, b.listing_type, b.status,
                  b.image_url, b.location, b.views_count, b.is_featured,
                  b.expires_at, b.created_at, b.updated_at, u.full_name, u.avatar_url
         ORDER BY b.is_featured DESC, b.created_at DESC
         OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        { ...params, offset, limit }
      );

      // Get total count
      const countResult = await executeQuery<{ total_count: number }>(
        `SELECT COUNT(*) as total_count
         FROM books b
         INNER JOIN users u ON b.user_id = u.id
         WHERE ${whereClause}`,
        params
      );

      const total = countResult[0]?.total_count || 0;

      return {
        books,
        total,
        page,
        pages: Math.ceil(total / limit)
      };

    } catch (error) {
      console.error('Search books error:', error);
      return { books: [], total: 0, page: 1, pages: 0 };
    }
  }

  async getBookDetails(bookId: string): Promise<Book | null> {
    try {
      const books = await executeQuery<Book>(
        `SELECT 
          b.*,
          u.full_name as user_name,
          u.avatar_url as user_avatar,
          COALESCE(AVG(CAST(br.rating as FLOAT)), 0) as user_rating
         FROM books b
         INNER JOIN users u ON b.user_id = u.id
         LEFT JOIN book_reviews br ON b.id = br.book_id
         WHERE b.id = @bookId
         GROUP BY b.id, b.user_id, b.title, b.author, b.isbn, b.description, 
                  b.condition, b.category, b.price, b.listing_type, b.status,
                  b.image_url, b.location, b.views_count, b.is_featured,
                  b.expires_at, b.created_at, b.updated_at, u.full_name, u.avatar_url`,
        { bookId }
      );

      return books.length > 0 ? books[0] : null;
    } catch (error) {
      console.error('Get book details error:', error);
      return null;
    }
  }

  async incrementViews(bookId: string): Promise<void> {
    try {
      await executeQuery(
        'UPDATE books SET views_count = views_count + 1 WHERE id = @bookId',
        { bookId }
      );
    } catch (error) {
      console.error('Increment views error:', error);
    }
  }

  private async updateUserStats(userId: string, action: string): Promise<void> {
    try {
      const xpGains: Record<string, number> = {
        'book_listed': 10,
        'book_sold': 25,
        'exchange_completed': 20,
        'first_review': 15,
        'profile_completed': 5
      };

      const xpGain = xpGains[action] || 0;

      if (xpGain > 0) {
        await executeQuery(
          'EXEC sp_UpdateUserXP @user_id, @xp_gained, @action',
          {
            user_id: userId,
            xp_gained: xpGain,
            action
          }
        );
      }

      // Update specific stats
      switch (action) {
        case 'book_listed':
          await executeQuery(
            'UPDATE user_stats SET books_listed = books_listed + 1 WHERE user_id = @userId',
            { userId }
          );
          break;
        case 'book_sold':
          await executeQuery(
            'UPDATE user_stats SET books_sold = books_sold + 1, successful_exchanges = successful_exchanges + 1 WHERE user_id = @userId',
            { userId }
          );
          break;
      }
    } catch (error) {
      console.error('Update user stats error:', error);
    }
  }
}

// Export singleton instance
export const bookService = new BookServiceImpl();