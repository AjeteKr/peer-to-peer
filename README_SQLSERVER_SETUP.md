# 📚 Peer-to-Peer Book Exchange - SQL Server Setup Guide

Your project has been successfully migrated from Supabase to **Microsoft SQL Server**! 🎉

## 🚀 What's New

### ✅ **Completed Migration**
- ✅ Replaced Supabase with SQL Server integration
- ✅ Added JWT-based authentication system
- ✅ Created comprehensive database schema
- ✅ Updated all API routes for SQL Server
- ✅ Fixed authentication middleware
- ✅ Updated frontend to use new APIs

### 🛠️ **Tech Stack**
- **Database**: Microsoft SQL Server / SQL Server Express
- **ORM**: Native `mssql` driver with connection pooling
- **Authentication**: JWT tokens with bcryptjs password hashing
- **APIs**: Next.js API routes with TypeScript
- **Frontend**: React with modern UI components

---

## 📋 **Setup Instructions**

### **1. Install SQL Server (Choose One)**

#### **Option A: SQL Server Express (Free, Local)**
1. Download SQL Server Express: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Install with default settings
3. Enable TCP/IP in SQL Server Configuration Manager
4. Start SQL Server services

#### **Option B: SQL Server Developer Edition (Free, Full Features)**
1. Download from Microsoft: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Install with SQL Server Management Studio (SSMS)

#### **Option C: Azure SQL Database (Cloud)**
1. Create Azure SQL Database instance
2. Get connection string from Azure Portal

### **2. Configure Database Connection**

Update your `.env.local` file with your SQL Server details:

```bash
# For SQL Server Express (Local)
SQL_SERVER_HOST=localhost
SQL_SERVER_PORT=1433
SQL_SERVER_USER=sa
SQL_SERVER_PASSWORD=YourStrongPassword123!
SQL_SERVER_DATABASE=BookExchangeDB
SQL_SERVER_INSTANCE=SQLEXPRESS
SQL_SERVER_ENCRYPT=false
SQL_SERVER_TRUST_CERT=true

# For Azure SQL Database
# SQL_SERVER_HOST=your-server.database.windows.net
# SQL_SERVER_PORT=1433
# SQL_SERVER_USER=your-username
# SQL_SERVER_PASSWORD=your-password
# SQL_SERVER_DATABASE=BookExchangeDB
# SQL_SERVER_ENCRYPT=true
# SQL_SERVER_TRUST_CERT=false
```

### **3. Run Database Setup**

1. **Open SQL Server Management Studio (SSMS)** or **Azure Data Studio**
2. **Connect to your SQL Server instance**
3. **Copy and paste the entire contents** of `SQLSERVER_DATABASE_SETUP.sql`
4. **Execute the script** (F5 or click Run)

The script will create:
- ✅ Database (`BookExchangeDB`)
- ✅ All tables (users, books, exchanges, messages, etc.)
- ✅ Indexes for performance
- ✅ Triggers for auto-timestamps
- ✅ Sample data with admin user

### **4. Test Your Setup**

```bash
# Start the development server
npm run dev
```

Visit: http://localhost:3000

**Test Account:**
- Email: `admin@bookexchange.com`
- Password: `admin123`

---

## 🗃️ **Database Schema**

### **Core Tables**
- **`users`** - Authentication + user profiles
- **`books`** - Book listings with categories, conditions, prices
- **`exchanges`** - Exchange requests between users
- **`messages`** - Chat system for exchange coordination

### **Gamification Tables**
- **`user_stats`** - XP, levels, achievement tracking
- **`user_badges`** - Earned badges and achievements

### **Additional Features**
- **`book_reviews`** - Rating system for books
- **`favorites`** - User wishlist/favorites

---

## 🔧 **Key Features**

### **📱 Authentication System**
- JWT-based authentication with HTTP-only cookies
- Bcrypt password hashing (12 rounds)
- Protected routes with middleware
- Automatic token refresh

### **🔍 API Endpoints**
```
POST /api/auth/register  - User registration
POST /api/auth/login     - User login
POST /api/auth/logout    - User logout

GET  /api/books          - List books (with filters)
POST /api/books          - Create book listing

GET  /api/exchanges      - User's exchanges
POST /api/exchanges      - Create exchange request

GET  /api/messages       - Messages/conversations
POST /api/messages       - Send message
```

### **🎮 Gamification Features**
- XP system for activities
- Level progression (1-50)
- Achievement badges
- Streak tracking
- Leaderboards

---

## 🛡️ **Security Features**

### **Database Security**
- Parameterized queries (SQL injection protection)
- Connection pooling with timeouts
- Input validation and sanitization
- Transaction support for data integrity

### **Authentication Security**
- JWT tokens with expiration
- HTTP-only secure cookies
- Password strength requirements
- Protected API routes

---

## 🚨 **Troubleshooting**

### **Connection Issues**
```bash
# Test SQL Server connection
sqlcmd -S localhost -U sa -P YourPassword123!

# For SQL Server Express
sqlcmd -S localhost\SQLEXPRESS -U sa -P YourPassword123!
```

### **Common Fixes**
1. **SQL Server not running**: Start SQL Server services in Services.msc
2. **TCP/IP disabled**: Enable in SQL Server Configuration Manager
3. **Firewall blocking**: Add port 1433 exception
4. **Authentication failed**: Check username/password in .env.local

### **Database Setup Issues**
1. **Permission denied**: Run SSMS as Administrator
2. **Database already exists**: Drop existing database first
3. **Login failed**: Create SQL Server login for 'sa' user

---

## 📊 **Performance Optimization**

### **Database Indexes**
- User email lookup
- Book category and status
- Exchange relationships
- Message threading

### **Connection Pooling**
- Automatic connection management
- Query timeout handling
- Resource cleanup

---

## 🎯 **Next Steps**

1. ✅ **Complete database setup**
2. ✅ **Test user registration and login**
3. ✅ **Create your first book listing**
4. ✅ **Test messaging system**
5. 🔄 **Customize for your university/organization**
6. 🚀 **Deploy to production**

---

## 💡 **Production Deployment**

### **Environment Variables**
Update for production:
- Use strong, unique JWT secrets
- Enable SQL Server encryption
- Configure proper CORS settings
- Set up SSL certificates

### **Database Considerations**
- Regular backups
- Performance monitoring
- Index optimization
- Connection limits

---

## 🆘 **Need Help?**

If you encounter any issues:

1. **Check the console logs** for error details
2. **Verify SQL Server is running** and accessible
3. **Confirm database setup** was completed successfully
4. **Test API endpoints** individually
5. **Check environment variables** are correct

Your peer-to-peer book exchange platform is now powered by SQL Server and ready to help students trade books efficiently! 📚✨