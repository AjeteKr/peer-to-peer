import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/sqlserver/connection';
import { getAuthenticatedUser } from '@/lib/sqlserver/auth';

export interface Message {
  id: string;
  exchange_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'system' | 'image';
  is_read: boolean;
  created_at: Date;
  // Joined fields
  sender_name?: string;
  sender_avatar?: string;
}

// GET /api/messages - Fetch messages for user's exchanges
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const exchangeId = searchParams.get('exchange_id');

    if (exchangeId) {
      // Get messages for specific exchange
      const messages = await executeQuery<Message>(
        `SELECT 
          m.*,
          u.full_name as sender_name,
          u.avatar_url as sender_avatar
        FROM messages m
        INNER JOIN users u ON m.sender_id = u.id
        INNER JOIN exchanges e ON m.exchange_id = e.id
        WHERE m.exchange_id = @exchangeId 
          AND (e.seller_id = @userId OR e.buyer_id = @userId)
        ORDER BY m.created_at ASC`,
        { exchangeId, userId: user.id }
      );

      return NextResponse.json({ messages });
    } else {
      // Get all conversations (latest message from each exchange)
      const conversations = await executeQuery<any>(
        `WITH LatestMessages AS (
          SELECT 
            m.exchange_id,
            m.content,
            m.created_at,
            m.sender_id,
            ROW_NUMBER() OVER (PARTITION BY m.exchange_id ORDER BY m.created_at DESC) as rn
          FROM messages m
          INNER JOIN exchanges e ON m.exchange_id = e.id
          WHERE (e.seller_id = @userId OR e.buyer_id = @userId)
        )
        SELECT 
          e.id as exchange_id,
          e.status,
          b.title as book_title,
          b.author as book_author,
          b.image_url as book_image_url,
          lm.content as last_message,
          lm.created_at as last_message_time,
          CASE 
            WHEN e.seller_id = @userId THEN buyer.full_name
            ELSE seller.full_name
          END as other_user_name,
          CASE 
            WHEN e.seller_id = @userId THEN buyer.avatar_url
            ELSE seller.avatar_url
          END as other_user_avatar,
          (SELECT COUNT(*) FROM messages m2 
           WHERE m2.exchange_id = e.id 
             AND m2.sender_id != @userId 
             AND m2.is_read = 0) as unread_count
        FROM exchanges e
        INNER JOIN books b ON e.book_id = b.id
        INNER JOIN users seller ON e.seller_id = seller.id
        INNER JOIN users buyer ON e.buyer_id = buyer.id
        LEFT JOIN LatestMessages lm ON e.id = lm.exchange_id AND lm.rn = 1
        WHERE (e.seller_id = @userId OR e.buyer_id = @userId)
        ORDER BY COALESCE(lm.created_at, e.created_at) DESC`,
        { userId: user.id }
      );

      return NextResponse.json({ conversations });
    }

  } catch (error) {
    console.error('❌ Messages API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { exchange_id, content, message_type = 'text' } = body;

    if (!exchange_id || !content) {
      return NextResponse.json(
        { error: 'Exchange ID and content are required' },
        { status: 400 }
      );
    }

    // Verify user is part of the exchange
    const exchanges = await executeQuery<{ id: string }>(
      'SELECT id FROM exchanges WHERE id = @exchangeId AND (seller_id = @userId OR buyer_id = @userId)',
      { exchangeId: exchange_id, userId: user.id }
    );

    if (exchanges.length === 0) {
      return NextResponse.json(
        { error: 'Exchange not found or access denied' },
        { status: 404 }
      );
    }

    const messageId = crypto.randomUUID();

    await executeQuery(
      `INSERT INTO messages (
        id, exchange_id, sender_id, content, message_type, created_at
      ) VALUES (
        @id, @exchangeId, @senderId, @content, @messageType, @createdAt
      )`,
      {
        id: messageId,
        exchangeId: exchange_id,
        senderId: user.id,
        content,
        messageType: message_type,
        createdAt: new Date()
      }
    );

    // Fetch the created message with sender info
    const createdMessages = await executeQuery<Message>(
      `SELECT 
        m.*,
        u.full_name as sender_name,
        u.avatar_url as sender_avatar
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      WHERE m.id = @id`,
      { id: messageId }
    );

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        data: createdMessages[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}