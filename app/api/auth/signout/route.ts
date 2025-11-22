import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });

    // Clear the auth_token cookie (for OTP/Password login)
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    // Clear NextAuth session cookies (for Google OAuth)
    response.cookies.set('next-auth.session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('__Secure-next-auth.session-token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    // Clear NextAuth callback cookies
    response.cookies.set('next-auth.callback-url', '', {
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('next-auth.csrf-token', '', {
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { error: 'Signout failed' },
      { status: 500 }
    );
  }
}
