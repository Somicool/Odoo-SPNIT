import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

export interface UserPayload {
  id: string;
  email: string;
  name?: string;
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token and return payload
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Set authentication cookie with JWT token
 */
export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Get authentication token from cookies
 */
export function getAuthToken(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get('auth_token')?.value;
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete('auth_token');
}

/**
 * Get current authenticated user from request
 */
export function getCurrentUser(): UserPayload | null {
  const token = getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Generate random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate OTP expiry time (5 minutes from now)
 */
export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5);
  return expiry;
}
