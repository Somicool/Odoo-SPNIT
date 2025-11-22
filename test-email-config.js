// Email Configuration Test Script
// Run this to test your email setup before using OTP login

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmailConfiguration() {
  console.log('\n🔍 Testing Email Configuration...\n');

  // Check environment variables
  console.log('📋 Configuration Check:');
  console.log('  MAIL_SERVER:', process.env.MAIL_SERVER || '❌ NOT SET');
  console.log('  MAIL_PORT:', process.env.MAIL_PORT || '❌ NOT SET');
  console.log('  MAIL_USERNAME:', process.env.MAIL_USERNAME || '❌ NOT SET');
  console.log('  MAIL_PASSWORD:', process.env.MAIL_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('');

  if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
    console.error('❌ Error: Email credentials not configured in .env.local');
    console.log('\n📝 To fix this:');
    console.log('1. Open .env.local file');
    console.log('2. Set MAIL_USERNAME to your Gmail address');
    console.log('3. Set MAIL_PASSWORD to your Gmail App Password');
    console.log('4. Get App Password from: https://myaccount.google.com/apppasswords\n');
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📧 Sending test email...');
    const testOTP = '123456';
    
    const info = await transporter.sendMail({
      from: `"StockMaster" <${process.env.MAIL_USERNAME}>`,
      to: process.env.MAIL_USERNAME, // Send to yourself
      subject: '✅ StockMaster OTP Test - Configuration Successful',
      text: `This is a test email from StockMaster.\n\nYour test OTP is: ${testOTP}\n\nIf you received this, your email configuration is working correctly!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #06b6d4;">✅ Email Configuration Test</h1>
          <p>Congratulations! Your StockMaster email configuration is working correctly.</p>
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${testOTP}</span>
          </div>
          <p>Your OTP login feature is now ready to use!</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('\n✨ Email configuration is working perfectly!');
    console.log('🎉 You can now use the OTP login feature.\n');
    
  } catch (error) {
    console.error('\n❌ Email configuration test failed!\n');
    console.error('Error details:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Common fixes:');
      console.log('   1. Make sure you\'re using an App Password, not your regular Gmail password');
      console.log('   2. Enable 2FA on your Google account first');
      console.log('   3. Generate App Password at: https://myaccount.google.com/apppasswords');
      console.log('   4. Copy the 16-character password (no spaces) to MAIL_PASSWORD in .env.local');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.log('\n💡 Connection failed. Possible fixes:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify MAIL_SERVER and MAIL_PORT are correct');
      console.log('   3. Check if your firewall is blocking SMTP (port 587)');
    } else {
      console.log('\n💡 Please check:');
      console.log('   1. MAIL_USERNAME is your full email address');
      console.log('   2. MAIL_PASSWORD is correct (App Password for Gmail)');
      console.log('   3. All environment variables are properly set in .env.local');
    }
    console.log('');
    process.exit(1);
  }
}

// Run the test
testEmailConfiguration();
