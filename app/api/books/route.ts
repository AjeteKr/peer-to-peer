import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/sqlserver/connection';
import { getAuthenticatedUser } from '@/lib/sqlserver/auth';

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  condition: 'new' | 'like_new' | 'good' | 'acceptable' | 'poor';
  category: string;
  price?: number;
  listing_type: 'sell' | 'exchange' | 'donate';
  status: 'available' | 'reserved' | 'sold';
  image_url?: string;
  location?: string;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  user_name?: string;
  user_avatar?: string;
}

// GET /api/books - Fetch all available books
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const condition = searchParams.get('condition');
    const listingType = searchParams.get('listing_type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.*,
        u.full_name as user_name,
        u.avatar_url as user_avatar
      FROM books b
      INNER JOIN users u ON b.user_id = u.id
      WHERE b.status = 'available'
    `;

    const params: Record<string, any> = {};

    if (category) {
      query += ' AND b.category = @category';
      params.category = category;
    }

    if (search) {
      query += ' AND (b.title LIKE @search OR b.author LIKE @search OR b.description LIKE @search)';
      params.search = `%${search}%`;
    }

    if (condition) {
      query += ' AND b.condition = @condition';
      params.condition = condition;
    }

    if (listingType) {
      query += ' AND b.listing_type = @listingType';
      params.listingType = listingType;
    }

    query += ' ORDER BY b.created_at DESC';
    query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
    
    params.offset = offset;
    params.limit = limit;

    const books = await executeQuery<Book>(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total_count
      FROM books b
      WHERE b.status = 'available'
    `;

    if (category) countQuery += ' AND b.category = @category';
    if (search) countQuery += ' AND (b.title LIKE @search OR b.author LIKE @search OR b.description LIKE @search)';
    if (condition) countQuery += ' AND b.condition = @condition';
    if (listingType) countQuery += ' AND b.listing_type = @listingType';

    const countResult = await executeQuery<{ total_count: number }>(countQuery, params);
    const totalCount = countResult[0]?.total_count || 0;

    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('❌ Books API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST /api/books - Create a new book listing
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      author,
      isbn,
      description,
      condition,
      category,
      price,
      listing_type,
      image_url,
      location
    } = body;

    // Validate required fields
    if (!title || !author || !condition || !category || !listing_type) {
      return NextResponse.json(
        { error: 'Title, author, condition, category, and listing type are required' },
        { status: 400 }
      );
    }

    // Validate enums
    const validConditions = ['new', 'like_new', 'good', 'acceptable', 'poor'];
    const validListingTypes = ['sell', 'exchange', 'donate'];

    if (!validConditions.includes(condition)) {
      return NextResponse.json(
        { error: 'Invalid condition value' },
        { status: 400 }
      );
    }

    if (!validListingTypes.includes(listing_type)) {
      return NextResponse.json(
        { error: 'Invalid listing type value' },
        { status: 400 }
      );
    }

    const bookId = crypto.randomUUID();

    await executeQuery(
      `INSERT INTO books (
        id, user_id, title, author, isbn, description, 
        condition, category, price, listing_type, 
        image_url, location, created_at, updated_at
      ) VALUES (
        @id, @userId, @title, @author, @isbn, @description,
        @condition, @category, @price, @listingType,
        @imageUrl, @location, @createdAt, @updatedAt
      )`,
      {
        id: bookId,
        userId: user.id,
        title,
        author,
        isbn: isbn || null,
        description: description || null,
        condition,
        category,
        price: price || null,
        listingType: listing_type,
        imageUrl: image_url || null,
        location: location || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    // Fetch the created book with user info
    const createdBooks = await executeQuery<Book>(
      `SELECT 
        b.*,
        u.full_name as user_name,
        u.avatar_url as user_avatar
      FROM books b
      INNER JOIN users u ON b.user_id = u.id
      WHERE b.id = @id`,
      { id: bookId }
    );

    return NextResponse.json(
      {
        message: 'Book created successfully',
        book: createdBooks[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Create book error:', error);
    return NextResponse.json(
      { error: 'Failed to create book listing' },
      { status: 500 }
    );
  }
}