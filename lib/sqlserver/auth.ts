import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { executeQuery } from './connection';

// Types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  university?: string;
  student_id?: string;
  phone?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResult {
  user: User | null;
  token: string | null;
  error: string | null;
}

// JWT configuration with production security
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Helper to generate JWT token
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET as string,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Helper to verify JWT token
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    console.error('❌ JWT verification failed:', error);
    return null;
  }
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Hash password with production-grade security
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 14; // Higher for production security
  return await bcrypt.hash(password, saltRounds);
}

// Verify password with timing attack protection
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// Register new user with comprehensive validation
export async function registerUser(
  email: string,
  password: string,
  fullName?: string,
  university?: string
): Promise<AuthResult> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        user: null,
        token: null,
        error: 'Invalid email format'
      };
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return {
        user: null,
        token: null,
        error: passwordValidation.errors.join('; ')
      };
    }

    // Check if user already exists
    const existingUsers = await executeQuery<{ id: string }>(
      'SELECT id FROM users WHERE email = @email',
      { email: email.toLowerCase() }
    );

    if (existingUsers.length > 0) {
      return {
        user: null,
        token: null,
        error: 'User with this email already exists'
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate unique ID
    const userId = crypto.randomUUID();

    // Insert user with transaction
    await executeQuery(
      `INSERT INTO users (id, email, password_hash, full_name, university, created_at, updated_at)
       VALUES (@id, @email, @passwordHash, @fullName, @university, @createdAt, @updatedAt)`,
      {
        id: userId,
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        fullName: fullName || null,
        university: university || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    // Create user stats entry
    await executeQuery(
      `INSERT INTO user_stats (user_id, experience_points, level_number, created_at, updated_at)
       VALUES (@userId, 0, 1, @createdAt, @updatedAt)`,
      {
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    // Get the created user (without password)
    const users = await executeQuery<User>(
      'SELECT id, email, full_name, university, student_id, phone, avatar_url, created_at, updated_at FROM users WHERE id = @id',
      { id: userId }
    );

    const user = users[0];
    const token = generateToken(user.id, user.email);

    // Log registration activity
    await executeQuery(
      `INSERT INTO activity_logs (user_id, action, resource_type, resource_id, created_at)
       VALUES (@userId, 'user_registered', 'user', @userId, @createdAt)`,
      {
        userId,
        createdAt: new Date()
      }
    );

    return {
      user,
      token,
      error: null
    };

  } catch (error) {
    console.error('❌ Registration error:', error);
    return {
      user: null,
      token: null,
      error: error instanceof Error ? error.message : 'Registration failed'
    };
  }
}

// Login user with security enhancements
export async function loginUser(
  email: string, 
  password: string, 
  ipAddress?: string, 
  userAgent?: string
): Promise<AuthResult> {
  try {
    // Validate input
    if (!email || !password) {
      return {
        user: null,
        token: null,
        error: 'Email and password are required'
      };
    }

    // Get user by email (case insensitive) and check if account is active
    const users = await executeQuery<User & { password_hash: string; is_active: boolean }>(
      'SELECT * FROM users WHERE email = @email',
      { email: email.toLowerCase() }
    );

    if (users.length === 0) {
      // Log failed login attempt
      await executeQuery(
        `INSERT INTO activity_logs (action, resource_type, details, ip_address, user_agent, created_at)
         VALUES ('login_failed', 'auth', @details, @ipAddress, @userAgent, @createdAt)`,
        {
          details: `Failed login attempt for email: ${email.toLowerCase()}`,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          createdAt: new Date()
        }
      );

      return {
        user: null,
        token: null,
        error: 'Invalid email or password'
      };
    }

    const user = users[0];

    // Check if account is active (not banned)
    if (!user.is_active) {
      // Log banned user login attempt
      await executeQuery(
        `INSERT INTO activity_logs (user_id, action, resource_type, details, ip_address, user_agent, created_at)
         VALUES (@userId, 'login_blocked', 'auth', @details, @ipAddress, @userAgent, @createdAt)`,
        {
          userId: user.id,
          details: 'Login attempt for deactivated/banned account',
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          createdAt: new Date()
        }
      );

      return {
        user: null,
        token: null,
        error: 'Your account has been deactivated. Please contact support.'
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      // Log failed login attempt
      await executeQuery(
        `INSERT INTO activity_logs (user_id, action, resource_type, details, ip_address, user_agent, created_at)
         VALUES (@userId, 'login_failed', 'auth', 'Invalid password', @ipAddress, @userAgent, @createdAt)`,
        {
          userId: user.id,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          createdAt: new Date()
        }
      );

      return {
        user: null,
        token: null,
        error: 'Invalid email or password'
      };
    }

    // Update last login time
    await executeQuery(
      'UPDATE users SET last_login_at = @lastLogin WHERE id = @userId',
      {
        userId: user.id,
        lastLogin: new Date()
      }
    );

    // Log successful login
    await executeQuery(
      `INSERT INTO activity_logs (user_id, action, resource_type, details, ip_address, user_agent, created_at)
       VALUES (@userId, 'login_success', 'auth', 'User logged in', @ipAddress, @userAgent, @createdAt)`,
      {
        userId: user.id,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        createdAt: new Date()
      }
    );

    // Remove sensitive data from user object
    const { password_hash, is_active, ...userWithoutSensitiveData } = user;

    const token = generateToken(user.id, user.email);

    return {
      user: userWithoutSensitiveData,
      token,
      error: null
    };

  } catch (error) {
    console.error('❌ Login error:', error);
    return {
      user: null,
      token: null,
      error: 'Login failed due to server error'
    };
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const users = await executeQuery<User>(
      'SELECT id, email, full_name, university, student_id, phone, avatar_url, created_at, updated_at FROM users WHERE id = @id',
      { id: userId }
    );

    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('❌ Get user error:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'full_name' | 'university' | 'student_id' | 'phone' | 'avatar_url'>>
): Promise<User | null> {
  try {
    const setClause = Object.keys(updates)
      .map(key => `${key} = @${key}`)
      .join(', ');

    if (!setClause) return null;

    await executeQuery(
      `UPDATE users SET ${setClause}, updated_at = @updatedAt WHERE id = @id`,
      {
        ...updates,
        updatedAt: new Date(),
        id: userId
      }
    );

    return await getUserById(userId);
  } catch (error) {
    console.error('❌ Update profile error:', error);
    return null;
  }
}

// Middleware helper for protected routes
export async function getAuthenticatedUser(request: Request): Promise<User | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      return null;
    }

    return await getUserById(decoded.userId);
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return null;
  }
}