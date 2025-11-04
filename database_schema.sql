-- Production Database Schema for Peer-to-Peer Book Exchange
-- Database: . (dot)
-- Execute in SQL Server Management Studio or Azure Data Studio

USE [.];

-- Drop existing tables if they exist (for clean setup)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'user_badges') DROP TABLE user_badges;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'user_stats') DROP TABLE user_stats;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'book_reviews') DROP TABLE book_reviews;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'favorites') DROP TABLE favorites;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'messages') DROP TABLE messages;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'exchanges') DROP TABLE exchanges;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'books') DROP TABLE books;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'users') DROP TABLE users;

-- 1. Users Table (Authentication + Profiles)
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255),
    university NVARCHAR(255),
    student_id NVARCHAR(100),
    phone NVARCHAR(20),
    avatar_url NVARCHAR(500),
    is_active BIT DEFAULT 1,
    email_verified BIT DEFAULT 0,
    last_login_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    INDEX IX_users_email (email),
    INDEX IX_users_active (is_active),
    INDEX IX_users_university (university)
);

-- 2. Books Table
CREATE TABLE books (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(500) NOT NULL,
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
    views_count INT DEFAULT 0,
    is_featured BIT DEFAULT 0,
    expires_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX IX_books_user_id (user_id),
    INDEX IX_books_category (category),
    INDEX IX_books_status (status),
    INDEX IX_books_listing_type (listing_type),
    INDEX IX_books_created_at (created_at DESC),
    INDEX IX_books_featured (is_featured, created_at DESC)
);

-- 3. Exchanges Table
CREATE TABLE exchanges (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    book_id UNIQUEIDENTIFIER NOT NULL,
    seller_id UNIQUEIDENTIFIER NOT NULL,
    buyer_id UNIQUEIDENTIFIER NOT NULL,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    message NTEXT,
    meeting_location NVARCHAR(255),
    meeting_time DATETIME2,
    exchange_completed_at DATETIME2,
    rating_by_seller TINYINT CHECK (rating_by_seller >= 1 AND rating_by_seller <= 5),
    rating_by_buyer TINYINT CHECK (rating_by_buyer >= 1 AND rating_by_buyer <= 5),
    seller_feedback NVARCHAR(1000),
    buyer_feedback NVARCHAR(1000),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    
    INDEX IX_exchanges_book_id (book_id),
    INDEX IX_exchanges_seller_id (seller_id),
    INDEX IX_exchanges_buyer_id (buyer_id),
    INDEX IX_exchanges_status (status),
    INDEX IX_exchanges_created_at (created_at DESC)
);

-- 4. Messages Table
CREATE TABLE messages (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    exchange_id UNIQUEIDENTIFIER NOT NULL,
    sender_id UNIQUEIDENTIFIER NOT NULL,
    content NTEXT NOT NULL,
    message_type NVARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'image')),
    is_read BIT DEFAULT 0,
    is_deleted BIT DEFAULT 0,
    attachment_url NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (exchange_id) REFERENCES exchanges(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    
    INDEX IX_messages_exchange_id (exchange_id),
    INDEX IX_messages_sender_id (sender_id),
    INDEX IX_messages_created_at (created_at DESC),
    INDEX IX_messages_unread (is_read, exchange_id)
);

-- 5. User Statistics Table (Gamification)
CREATE TABLE user_stats (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    experience_points INT DEFAULT 0,
    level_number INT DEFAULT 1,
    books_listed INT DEFAULT 0,
    books_sold INT DEFAULT 0,
    books_bought INT DEFAULT 0,
    successful_exchanges INT DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings_received INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATETIME2 DEFAULT GETDATE(),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX IX_user_stats_user_id (user_id),
    INDEX IX_user_stats_level (level_number DESC),
    INDEX IX_user_stats_xp (experience_points DESC)
);

-- 6. User Badges Table
CREATE TABLE user_badges (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    badge_id NVARCHAR(50) NOT NULL,
    badge_name NVARCHAR(100) NOT NULL,
    badge_description NVARCHAR(255),
    badge_icon NVARCHAR(50) NOT NULL,
    badge_rarity NVARCHAR(20) DEFAULT 'common' CHECK (badge_rarity IN ('common', 'rare', 'epic', 'legendary')),
    earned_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, badge_id),
    
    INDEX IX_user_badges_user_id (user_id),
    INDEX IX_user_badges_earned_at (earned_at DESC)
);

-- 7. Book Reviews Table
CREATE TABLE book_reviews (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    book_id UNIQUEIDENTIFIER NOT NULL,
    reviewer_id UNIQUEIDENTIFIER NOT NULL,
    exchange_id UNIQUEIDENTIFIER,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text NTEXT,
    is_verified_purchase BIT DEFAULT 0,
    helpful_votes INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (exchange_id) REFERENCES exchanges(id),
    UNIQUE(book_id, reviewer_id),
    
    INDEX IX_book_reviews_book_id (book_id),
    INDEX IX_book_reviews_rating (rating DESC),
    INDEX IX_book_reviews_created_at (created_at DESC)
);

-- 8. Favorites/Wishlist Table
CREATE TABLE favorites (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    book_id UNIQUEIDENTIFIER NOT NULL,
    notification_enabled BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE(user_id, book_id),
    
    INDEX IX_favorites_user_id (user_id),
    INDEX IX_favorites_book_id (book_id)
);

-- 9. Activity Log Table (Audit Trail)
CREATE TABLE activity_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER,
    action NVARCHAR(100) NOT NULL,
    resource_type NVARCHAR(50) NOT NULL,
    resource_id UNIQUEIDENTIFIER,
    details NVARCHAR(MAX),
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    INDEX IX_activity_logs_user_id (user_id),
    INDEX IX_activity_logs_action (action),
    INDEX IX_activity_logs_created_at (created_at DESC)
);

-- 10. Create Triggers for Updated_At columns
CREATE OR ALTER TRIGGER tr_users_updated_at
ON users
AFTER UPDATE
AS
BEGIN
    UPDATE users 
    SET updated_at = GETDATE()
    FROM users u
    INNER JOIN inserted i ON u.id = i.id;
END;

CREATE OR ALTER TRIGGER tr_books_updated_at
ON books
AFTER UPDATE
AS
BEGIN
    UPDATE books 
    SET updated_at = GETDATE()
    FROM books b
    INNER JOIN inserted i ON b.id = i.id;
END;

CREATE OR ALTER TRIGGER tr_exchanges_updated_at
ON exchanges
AFTER UPDATE
AS
BEGIN
    UPDATE exchanges 
    SET updated_at = GETDATE()
    FROM exchanges e
    INNER JOIN inserted i ON e.id = i.id;
END;

CREATE OR ALTER TRIGGER tr_user_stats_updated_at
ON user_stats
AFTER UPDATE
AS
BEGIN
    UPDATE user_stats 
    SET updated_at = GETDATE()
    FROM user_stats us
    INNER JOIN inserted i ON us.id = i.id;
END;

-- 11. Create Stored Procedures for Common Operations

-- Get User Dashboard Stats
CREATE OR ALTER PROCEDURE sp_GetUserDashboardStats
    @user_id UNIQUEIDENTIFIER
AS
BEGIN
    SELECT 
        us.experience_points,
        us.level_number,
        us.books_listed,
        us.books_sold,
        us.books_bought,
        us.successful_exchanges,
        us.average_rating,
        us.streak_days,
        (SELECT COUNT(*) FROM messages m 
         INNER JOIN exchanges e ON m.exchange_id = e.id 
         WHERE (e.seller_id = @user_id OR e.buyer_id = @user_id) 
         AND m.sender_id != @user_id AND m.is_read = 0) as unread_messages,
        (SELECT COUNT(*) FROM exchanges 
         WHERE (seller_id = @user_id OR buyer_id = @user_id) 
         AND status = 'pending') as pending_exchanges
    FROM user_stats us
    WHERE us.user_id = @user_id;
END;

-- Update User XP and Level
CREATE OR ALTER PROCEDURE sp_UpdateUserXP
    @user_id UNIQUEIDENTIFIER,
    @xp_gained INT,
    @action NVARCHAR(100)
AS
BEGIN
    DECLARE @current_xp INT, @current_level INT, @new_level INT;
    
    -- Get current stats
    SELECT @current_xp = experience_points, @current_level = level_number
    FROM user_stats WHERE user_id = @user_id;
    
    -- Update XP
    UPDATE user_stats 
    SET experience_points = experience_points + @xp_gained,
        updated_at = GETDATE()
    WHERE user_id = @user_id;
    
    -- Calculate new level (every 100 XP = 1 level)
    SET @new_level = (@current_xp + @xp_gained) / 100 + 1;
    
    -- Update level if changed
    IF @new_level > @current_level
    BEGIN
        UPDATE user_stats 
        SET level_number = @new_level
        WHERE user_id = @user_id;
    END
    
    -- Log activity
    INSERT INTO activity_logs (user_id, action, resource_type, details)
    VALUES (@user_id, @action, 'xp_gain', CONCAT('Gained ', @xp_gained, ' XP'));
END;

PRINT 'Database schema created successfully!';
PRINT 'Tables: users, books, exchanges, messages, user_stats, user_badges, book_reviews, favorites, activity_logs';
PRINT 'Triggers: Auto-update timestamps';
PRINT 'Procedures: Dashboard stats, XP system';
PRINT 'Ready for production use!';