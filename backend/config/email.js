import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create Nodemailer transporter
 * Supports Gmail, Mailtrap, and Ethereal for testing
 */
const createTransporter = async () => {
  // If using Gmail (production)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      }
    });
  }
  
  // If using Mailtrap (development testing)
  if (process.env.EMAIL_SERVICE === 'mailtrap') {
    return nodemailer.createTransporter({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  // Default: Use Ethereal (instant test emails - no signup needed)
  console.log('📧 Creating Ethereal test account for email testing...');
  const testAccount = await nodemailer.createTestAccount();
  
  console.log('✅ Ethereal Email Account Created!');
  console.log('📬 Preview emails at: https://ethereal.email/messages');
  console.log('👤 Username:', testAccount.user);
  console.log('🔑 Password:', testAccount.pass);
  console.log('\n⚠️  For production, set EMAIL_SERVICE=gmail in .env\n');
  
  return nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} username - User's name
 */
export const sendPasswordResetEmail = async (email, resetToken, username) => {
  const transporter = await createTransporter();
  
  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"Chat App" <${process.env.EMAIL_USER || 'noreply@chatapp.com'}>`,
    to: email,
    subject: 'Password Reset Request - Chat App',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #3b82f6, #9333ea);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${username}</strong>,</p>
            <p>We received a request to reset your password for your Chat App account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetURL}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetURL}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0;">
                <li>This link will expire in <strong>15 minutes</strong></li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Chat App. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    
    // If using Ethereal, show preview URL
    if (process.env.EMAIL_SERVICE !== 'gmail' && process.env.EMAIL_SERVICE !== 'mailtrap') {
      console.log('👁️  Preview URL:', nodemailer.getTestMessageUrl(info));
      console.log('\n👆 Open this URL to see the email!\n');
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send welcome email to new users
 * @param {string} email - New user's email
 * @param {string} username - New user's name
 */
export const sendWelcomeEmail = async (email, username) => {
  const transporter = await createTransporter();
  
  const mailOptions = {
    from: `"Chat App" <${process.env.EMAIL_USER || 'noreply@chatapp.com'}>`,
    to: email,
    subject: 'Welcome to Chat App! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
          .content { padding: 30px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Chat App!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            <p>Thank you for joining Chat App! We're excited to have you on board.</p>
            <p>🚀 <strong>Get started:</strong></p>
            <ul>
              <li>Complete your profile</li>
              <li>Start chatting with friends</li>
              <li>Customize your settings</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy chatting! 💬</p>
          </div>
          <div class="footer">
            <p>© 2025 Chat App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    
    // If using Ethereal, show preview URL
    if (process.env.EMAIL_SERVICE !== 'gmail' && process.env.EMAIL_SERVICE !== 'mailtrap') {
      console.log('👁️  Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
    return { success: false, error: error.message };
  }
};

export default { sendPasswordResetEmail, sendWelcomeEmail };
