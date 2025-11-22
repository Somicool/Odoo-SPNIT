import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // First, check for NextAuth session (Google OAuth)
    const session = await getServerSession(authOptions);
    
    if (session?.user) {
      return NextResponse.json({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || session.user.email?.split('@')[0],
      });
    }

    // Fall back to checking auth_token cookie (OTP/Password login)
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
