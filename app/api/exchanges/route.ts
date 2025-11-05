import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/sqlserver/connection';
import { authenticateRequest } from '@/lib/sqlserver/middleware';

export interface Exchange {
  id: string;
  book_id: string;
  seller_id: string;
  buyer_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  message?: string;
  meeting_location?: string;
  meeting_time?: Date;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  book_title?: string;
  book_author?: string;
  book_image_url?: string;
  seller_name?: string;
  buyer_name?: string;
}

// GET /api/exchanges - Fetch user's exchanges
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // 'selling' or 'buying'

    let query = `
      SELECT 
        e.*,
        b.title as book_title,
        b.author as book_author,
        b.image_url as book_image_url,
        seller.full_name as seller_name,
        buyer.full_name as buyer_name
      FROM exchanges e
      INNER JOIN books b ON e.book_id = b.id
      INNER JOIN users seller ON e.seller_id = seller.id
      INNER JOIN users buyer ON e.buyer_id = buyer.id
      WHERE (e.seller_id = @userId OR e.buyer_id = @userId)
    `;

    const params: Record<string, any> = { userId: user.id };

    if (status) {
      query += ' AND e.status = @status';
      params.status = status;
    }

    if (type === 'selling') {
      query += ' AND e.seller_id = @userId';
    } else if (type === 'buying') {
      query += ' AND e.buyer_id = @userId';
    }

    query += ' ORDER BY e.created_at DESC';

    const exchanges = await executeQuery<Exchange>(query, params);

    return NextResponse.json({ exchanges });

  } catch (error) {
    console.error('❌ Exchanges API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchanges' },
      { status: 500 }
    );
  }
}

// POST /api/exchanges - Create new exchange request
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { book_id, message, meeting_location, meeting_time } = body;

    if (!book_id) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Get book details to verify it exists and get seller
    const books = await executeQuery<{ id: string; user_id: string; status: string }>(
      'SELECT id, user_id, status FROM books WHERE id = @bookId',
      { bookId: book_id }
    );

    if (books.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    const book = books[0];

    if (book.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot create exchange request for your own book' },
        { status: 400 }
      );
    }

    if (book.status !== 'available') {
      return NextResponse.json(
        { error: 'Book is not available for exchange' },
        { status: 400 }
      );
    }

    const exchangeId = crypto.randomUUID();

    await executeQuery(
      `INSERT INTO exchanges (
        id, book_id, seller_id, buyer_id, message, 
        meeting_location, meeting_time, created_at, updated_at
      ) VALUES (
        @id, @bookId, @sellerId, @buyerId, @message,
        @meetingLocation, @meetingTime, @createdAt, @updatedAt
      )`,
      {
        id: exchangeId,
        bookId: book_id,
        sellerId: book.user_id,
        buyerId: user.id,
        message: message || null,
        meetingLocation: meeting_location || null,
        meetingTime: meeting_time ? new Date(meeting_time) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    // Fetch the created exchange with details
    const createdExchanges = await executeQuery<Exchange>(
      `SELECT 
        e.*,
        b.title as book_title,
        b.author as book_author,
        b.image_url as book_image_url,
        seller.full_name as seller_name,
        buyer.full_name as buyer_name
      FROM exchanges e
      INNER JOIN books b ON e.book_id = b.id
      INNER JOIN users seller ON e.seller_id = seller.id
      INNER JOIN users buyer ON e.buyer_id = buyer.id
      WHERE e.id = @id`,
      { id: exchangeId }
    );

    return NextResponse.json(
      {
        message: 'Exchange request created successfully',
        exchange: createdExchanges[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Create exchange error:', error);
    return NextResponse.json(
      { error: 'Failed to create exchange request' },
      { status: 500 }
    );
  }
}