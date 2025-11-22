import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, serviceRole);

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be a 6-digit number' },
        { status: 400 }
      );
    }

    // Get the latest OTP for this email
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return NextResponse.json(
        { error: 'OTP not found or expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    const expiresAt = new Date(otpRecord.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      // Delete expired OTP
      await supabase
        .from('otp_verifications')
        .delete()
        .eq('email', email.toLowerCase());

      return NextResponse.json(
        { error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid - delete it from database
    await supabase
      .from('otp_verifications')
      .delete()
      .eq('email', email.toLowerCase());

    // Check if user exists, if not create new user
    let userId: string;
    let userName: string;

    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      userId = existingUser.id;
      userName = existingUser.name || existingUser.email.split('@')[0];
    } else {
      // Create new user using upsert for race condition safety
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .upsert({
          email: email.toLowerCase(),
          name: email.split('@')[0],
          auth_method: 'otp',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'email'
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('User creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      userId = newUser.id;
      userName = newUser.name;
    }

    // Generate JWT token
    const token = generateToken({
      id: userId,
      email: email.toLowerCase(),
      name: userName,
    });

    // Create response with success
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userId,
        email: email.toLowerCase(),
        name: userName,
      },
    });

    // Set HTTP-only cookie with JWT token
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
