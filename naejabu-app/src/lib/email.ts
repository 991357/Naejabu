import nodemailer from 'nodemailer';

// Define the interface for the email options
interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

// 1. Configure the email transport using nodemailer
// IMPORTANT: You need to provide your own email service credentials here.
// The following is an example for Gmail. You might need to enable "Less secure app access"
// in your Google account, or preferably, use an "App Password".
const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., 'gmail', 'naver', 'daum', etc.
  host: 'smtp.gmail.com', // SMTP server host
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    // !!! IMPORTANT !!!
    // Replace these with your own email credentials in a .env.local file
    // For security, do not hardcode them here.
    // Example: user: process.env.EMAIL_USER
    user: process.env.EMAIL_USER || 'YOUR_GMAIL_ADDRESS@gmail.com', // Your email address
    pass: process.env.EMAIL_PASS || 'YOUR_GMAIL_APP_PASSWORD',      // Your email app password
  },
});

// 2. Create a function to send emails
export const sendMail = async (options: MailOptions) => {
  try {
    // Add a default 'from' address
    const mailOptionsWithFrom = {
      ...options,
      from: `"내자부" <${process.env.EMAIL_USER || 'YOUR_GMAIL_ADDRESS@gmail.com'}>`,
    };
    
    await transporter.sendMail(mailOptionsWithFrom);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// 3. Create a specific function for sending the verification email
export const sendVerificationEmail = async (email: string, token: string) => {
  // Construct the verification link
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify/${token}`;

  const mailOptions: MailOptions = {
    to: email,
    subject: '[내자부] 회원가입을 위한 이메일 인증을 완료해주세요.',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2>내자부 회원가입 인증</h2>
        <p>내자부에 가입해주셔서 감사합니다! 아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 15px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px; font-size: 16px; margin: 20px 0;">
          이메일 인증하기
        </a>
        <p>만약 버튼이 작동하지 않으면, 아래 링크를 복사하여 브라우저에 붙여넣어 주세요:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <hr/>
        <p style="font-size: 12px; color: #888;">본인이 요청하지 않은 경우 이 이메일을 무시해 주세요.</p>
      </div>
    `,
  };

  return await sendMail(mailOptions);
};

// 4. Create a specific function for sending the verification code email
export const sendVerificationCodeEmail = async (email: string, code: string) => {
  const mailOptions: MailOptions = {
    to: email,
    subject: '[내자부] 회원가입 인증 코드 안내',
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4A90E2; color: #ffffff; padding: 20px 30px;">
          <h1 style="margin: 0; font-size: 24px;">내자부 이메일 인증</h1>
        </div>
        <div style="padding: 30px 30px 40px 30px; color: #333333;">
          <h2 style="font-size: 20px; margin-top: 0; margin-bottom: 20px;">인증 코드를 확인해주세요.</h2>
          <p style="margin-bottom: 25px; font-size: 16px; line-height: 1.6;">안녕하세요! 내자부 회원가입을 계속하려면 아래 인증 코드를 입력해주세요.</p>
          <div style="background-color: #f5f5f5; border-radius: 4px; text-align: center; padding: 20px;">
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0; color: #4A90E2;">${code}</p>
          </div>
          <p style="margin-top: 25px; font-size: 14px; color: #888888;">이 인증 코드는 10분 동안 유효합니다.</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px 30px; text-align: center; font-size: 12px; color: #888888;">
          <p style="margin: 0;">본인이 요청하지 않은 경우 이 이메일을 무시해 주세요.</p>
          <p style="margin: 5px 0 0 0;">&copy; 2025 내자부. All Rights Reserved.</p>
        </div>
      </div>
    `,
  };

  return await sendMail(mailOptions);
};
