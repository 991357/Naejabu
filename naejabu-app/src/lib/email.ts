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
