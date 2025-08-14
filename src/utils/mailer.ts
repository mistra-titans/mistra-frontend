

import nodemailer from 'nodemailer';

// Interface for email configuration
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Interface for the function parameters
interface SendOTPParams {
  otpCode: string;
  userEmail: string;
  senderName?: string;
  subject?: string;
}

// Interface for the response
interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends an OTP code to the specified email address
 * @param params - Object containing OTP code, user email, and optional parameters
 * @returns Promise with email sending result
 */
export async function sendOTPEmail(params: SendOTPParams): Promise<EmailResponse> {
  const {
    otpCode,
    userEmail,
    senderName = 'Your App',
    subject = 'Your Verification Code'
  } = params;

  // Email configuration - replace with your SMTP settings
  const emailConfig: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  };

  try {
    // Create transporter
    const transporter = nodemailer.createTransport(emailConfig);

    // Verify transporter configuration
    await transporter.verify();

    // Email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Verification Code</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-top: 0;">Hello!</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              You requested a verification code. Please use the code below to verify your account:
            </p>
            
            <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                ${otpCode}
              </span>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 25px;">
              <strong>Important:</strong> This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              This email was sent by ${senderName}. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    const textContent = `
      Verification Code
      
      Hello!
      
      You requested a verification code. Please use the code below to verify your account:
      
      ${otpCode}
      
      Important: This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
      
      This email was sent by ${senderName}. Please do not reply to this email.
    `;

    // Email options
    const mailOptions = {
      from: `"${senderName}" <${emailConfig.auth.user}>`,
      to: userEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Error sending OTP email:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}