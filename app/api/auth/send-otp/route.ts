import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { generateOTP, getOTPExpiry } from '@/lib/auth-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, serviceRole);

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  }
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Hash OTP before storing
    const otpHash = await bcrypt.hash(otp, 10);

    // Store OTP in Supabase
    const { error: dbError } = await supabase
      .from('otp_verifications')
      .insert({
        email: email.toLowerCase(),
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to generate OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Send OTP email
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="background: linear-gradient(to right, #06b6d4, #2563eb, #4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 36px; margin: 0; font-weight: 900;">StockMaster</h1>
            </div>
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Dear User,</h2>
            <p style="font-size: 16px;">Your One-Time Password (OTP) for accessing your <strong>StockMaster</strong> account is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); color: white; padding: 15px 30px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="font-size: 16px;">This OTP is valid for the next <strong>5 minutes</strong> and can be used only once.</p>
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;"><strong>⚠️ Security Notice:</strong> For your security, please do not share this code with anyone under any circumstances — including individuals claiming to be from customer support or the <strong>StockMaster</strong> team.</p>
            </div>
            <p style="font-size: 14px; color: #666;">If you did not request this code, please ignore this message and consider securing your account immediately.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message from StockMaster. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `;

    const textBody = `Dear User,

Your One-Time Password (OTP) for accessing your StockMaster account is: ${otp}.

This OTP is valid for the next 5 minutes and can be used only once.

For your security, please do not share this code with anyone under any circumstances — including individuals claiming to be from customer support or the StockMaster team.

If you did not request this code, please ignore this message and consider securing your account immediately.`;

    try {
      // Check if we're in development mode without email configured
      const isDevelopment = process.env.NODE_ENV === 'development';
      const emailConfigured = process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD;

      if (!emailConfigured && isDevelopment) {
        // Development mode: Log OTP to console instead of sending email
        console.log('\n' + '='.repeat(60));
        console.log('🔐 OTP DEVELOPMENT MODE - Email Not Configured');
        console.log('='.repeat(60));
        console.log(`📧 Email: ${email}`);
        console.log(`🔢 OTP Code: ${otp}`);
        console.log(`⏰ Expires: ${expiresAt.toLocaleString()}`);
        console.log('='.repeat(60) + '\n');

        return NextResponse.json({
          success: true,
          message: 'OTP generated successfully (check server console for code)',
          devMode: true,
          otp: isDevelopment ? otp : undefined, // Only return OTP in dev mode
        });
      }

      if (!emailConfigured) {
        console.error('Email credentials not configured. MAIL_USERNAME or MAIL_PASSWORD is missing.');
        return NextResponse.json(
          { error: 'Email service not configured. Please contact administrator.' },
          { status: 500 }
        );
      }

      // Production mode: Send actual email
      await transporter.sendMail({
        from: `"StockMaster" <${process.env.MAIL_USERNAME}>`,
        to: email,
        subject: 'Your OTP Code - StockMaster',
        text: textBody,
        html: htmlBody,
      });

      console.log(`✅ OTP sent successfully to ${email}`);

      return NextResponse.json({
        success: true,
        message: 'OTP sent to your email successfully',
      });
    } catch (emailError: any) {
      console.error('❌ Email error:', emailError);
      console.error('Error details:', {
        code: emailError.code,
        command: emailError.command,
        response: emailError.response,
        responseCode: emailError.responseCode,
      });
      
      // Delete the OTP from database since email failed
      await supabase
        .from('otp_verifications')
        .delete()
        .eq('email', email.toLowerCase());

      // Provide helpful error messages
      let errorMessage = 'Failed to send OTP email.';
      
      if (emailError.code === 'EAUTH') {
        errorMessage = 'Email authentication failed. Please check your email credentials or use a Gmail App Password.';
      } else if (emailError.responseCode === 535) {
        errorMessage = 'Invalid email credentials. For Gmail, please use an App Password from https://myaccount.google.com/apppasswords';
      }

      return NextResponse.json(
        { error: `${errorMessage} ${emailError.message || ''}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
