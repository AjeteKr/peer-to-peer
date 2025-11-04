-- SQL Server Database Setup for Peer-to-Peer Book Exchange
-- Run this script in SQL Server Management Studio (SSMS) or Azure Data Studio

-- Create database (if not exists)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'BookExchangeDB')
BEGIN
    CREATE DATABASE BookExchangeDB;
END;

USE BookExchangeDB;

-- 1. Users Table (Authentication + Profiles)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        email NVARCHAR(255) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        full_name NVARCHAR(255),
        university NVARCHAR(255),
        student_id NVARCHAR(100),
        phone NVARCHAR(20),
        avatar_url NVARCHAR(500),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );

    CREATE INDEX IX_users_email ON users(email);
END;

-- 2. Books Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='books' AND xtype='U')
BEGIN
    CREATE TABLE books (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        title NVARCHAR(255) NOT NULL,
        author NVARCHAR(255) NOT NULL,
        isbn NVARCHAR(20),
        description NTEXT,
        condition NVARCHAR(20) NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'acceptable', 'poor')),
        category NVARCHAR(100) NOT NULL,
        price DECIMAL(10,2),
        listing_type NVARCHAR(20) NOT NULL CHECK (listing_type IN ('sell', 'exchange', 'donate')),
        status NVARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
        image_url NVARCHAR(500),
        location NVARCHAR(255),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_books_user_id ON books(user_id);
    CREATE INDEX IX_books_category ON books(category);
    CREATE INDEX IX_books_status ON books(status);
END;

-- 3. Exchanges Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='exchanges' AND xtype='U')
BEGIN
    CREATE TABLE exchanges (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        book_id UNIQUEIDENTIFIER NOT NULL,
        seller_id UNIQUEIDENTIFIER NOT NULL,
        buyer_id UNIQUEIDENTIFIER NOT NULL,
        status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
        message NTEXT,
        meeting_location NVARCHAR(255),
        meeting_time DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (seller_id) REFERENCES users(id),
        FOREIGN KEY (buyer_id) REFERENCES users(id)
    );

    CREATE INDEX IX_exchanges_book_id ON exchanges(book_id);
    CREATE INDEX IX_exchanges_seller_id ON exchanges(seller_id);
    CREATE INDEX IX_exchanges_buyer_id ON exchanges(buyer_id);
END;

-- 4. Messages Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='messages' AND xtype='U')
BEGIN
    CREATE TABLE messages (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        exchange_id UNIQUEIDENTIFIER NOT NULL,
        sender_id UNIQUEIDENTIFIER NOT NULL,
        content NTEXT NOT NULL,
        message_type NVARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'image')),
        is_read BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (exchange_id) REFERENCES exchanges(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id)
    );

    CREATE INDEX IX_messages_exchange_id ON messages(exchange_id);
    CREATE INDEX IX_messages_sender_id ON messages(sender_id);
END;

-- 5. Gamification Tables

-- User Stats Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_stats' AND xtype='U')
BEGIN
    CREATE TABLE user_stats (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
        experience_points INT DEFAULT 0,
        level_number INT DEFAULT 1,
        books_listed INT DEFAULT 0,
        books_sold INT DEFAULT 0,
        books_bought INT DEFAULT 0,
        successful_exchanges INT DEFAULT 0,
        streak_days INT DEFAULT 0,
        last_activity_date DATETIME2 DEFAULT GETDATE(),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_user_stats_user_id ON user_stats(user_id);
END;

-- User Badges Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_badges' AND xtype='U')
BEGIN
    CREATE TABLE user_badges (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        badge_id NVARCHAR(50) NOT NULL,
        badge_name NVARCHAR(100) NOT NULL,
        badge_icon NVARCHAR(50) NOT NULL,
        earned_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, badge_id)
    );

    CREATE INDEX IX_user_badges_user_id ON user_badges(user_id);
END;

-- 6. Book Reviews Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='book_reviews' AND xtype='U')
BEGIN
    CREATE TABLE book_reviews (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        book_id UNIQUEIDENTIFIER NOT NULL,
        reviewer_id UNIQUEIDENTIFIER NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text NTEXT,
        created_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id),
        UNIQUE(book_id, reviewer_id)
    );

    CREATE INDEX IX_book_reviews_book_id ON book_reviews(book_id);
END;

-- 7. Favorites/Wishlist Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='favorites' AND xtype='U')
BEGIN
    CREATE TABLE favorites (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        book_id UNIQUEIDENTIFIER NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        UNIQUE(user_id, book_id)
    );

    CREATE INDEX IX_favorites_user_id ON favorites(user_id);
END;

-- 8. Create Triggers for Updated_At columns
-- Users trigger
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_users_updated_at')
    DROP TRIGGER tr_users_updated_at;

CREATE TRIGGER tr_users_updated_at
ON users
AFTER UPDATE
AS
BEGIN
    UPDATE users 
    SET updated_at = GETDATE()
    FROM users u
    INNER JOIN inserted i ON u.id = i.id;
END;

-- Books trigger
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_books_updated_at')
    DROP TRIGGER tr_books_updated_at;

CREATE TRIGGER tr_books_updated_at
ON books
AFTER UPDATE
AS
BEGIN
    UPDATE books 
    SET updated_at = GETDATE()
    FROM books b
    INNER JOIN inserted i ON b.id = i.id;
END;

-- Exchanges trigger
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_exchanges_updated_at')
    DROP TRIGGER tr_exchanges_updated_at;

CREATE TRIGGER tr_exchanges_updated_at
ON exchanges
AFTER UPDATE
AS
BEGIN
    UPDATE exchanges 
    SET updated_at = GETDATE()
    FROM exchanges e
    INNER JOIN inserted i ON e.id = i.id;
END;

-- User Stats trigger
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_user_stats_updated_at')
    DROP TRIGGER tr_user_stats_updated_at;

CREATE TRIGGER tr_user_stats_updated_at
ON user_stats
AFTER UPDATE
AS
BEGIN
    UPDATE user_stats 
    SET updated_at = GETDATE()
    FROM user_stats us
    INNER JOIN inserted i ON us.id = i.id;
END;

-- 9. Insert Sample Data
-- Sample categories
DECLARE @categories TABLE (name NVARCHAR(100));
INSERT INTO @categories VALUES 
    ('Textbooks'), ('Fiction'), ('Science'), ('History'), 
    ('Technology'), ('Art'), ('Philosophy'), ('Business');

-- Sample admin user (password: admin123)
IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@bookexchange.com')
BEGIN
    INSERT INTO users (id, email, password_hash, full_name, university) VALUES 
    (NEWID(), 'admin@bookexchange.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewCq/emWGhwx5LWe', 'Admin User', 'Test University');
END;

-- Create user stats for admin
DECLARE @admin_id UNIQUEIDENTIFIER;
SELECT @admin_id = id FROM users WHERE email = 'admin@bookexchange.com';

IF NOT EXISTS (SELECT * FROM user_stats WHERE user_id = @admin_id)
BEGIN
    INSERT INTO user_stats (user_id, experience_points, level_number) 
    VALUES (@admin_id, 100, 2);
END;

-- Sample books
IF NOT EXISTS (SELECT * FROM books WHERE title = 'Introduction to Computer Science')
BEGIN
    INSERT INTO books (user_id, title, author, isbn, description, condition, category, price, listing_type, location) VALUES 
    (@admin_id, 'Introduction to Computer Science', 'John Smith', '978-0123456789', 'Great textbook for CS beginners', 'good', 'Technology', 45.00, 'sell', 'Campus Library'),
    (@admin_id, 'Advanced Mathematics', 'Jane Doe', '978-0987654321', 'Comprehensive math guide', 'like_new', 'Science', 60.00, 'exchange', 'Student Center'),
    (@admin_id, 'Modern Literature', 'Alice Johnson', '978-0456789123', 'Collection of contemporary works', 'new', 'Fiction', 35.00, 'sell', 'Bookstore Pickup');
END;

PRINT 'Database setup completed successfully!';
PRINT 'Tables created: users, books, exchanges, messages, user_stats, user_badges, book_reviews, favorites';
PRINT 'Sample data inserted with admin user (admin@bookexchange.com / admin123)';

-- Display table counts
SELECT 'users' as TableName, COUNT(*) as RecordCount FROM users
UNION ALL
SELECT 'books', COUNT(*) FROM books
UNION ALL
SELECT 'exchanges', COUNT(*) FROM exchanges
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'user_stats', COUNT(*) FROM user_stats
UNION ALL
SELECT 'user_badges', COUNT(*) FROM user_badges;