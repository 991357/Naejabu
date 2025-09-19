
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendVerificationCodeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Check if email already exists
    const userStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const existingUser = userStmt.get(email);

    if (existingUser) {
      return NextResponse.json({ message: '이미 가입된 이메일입니다.' }, { status: 409 });
    }

    // Generate a 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    // Delete any existing codes for this email
    const deleteStmt = db.prepare('DELETE FROM email_verifications WHERE email = ?');
    deleteStmt.run(email);

    // Store the new code
    const insertStmt = db.prepare(
      'INSERT INTO email_verifications (email, code, expires_at) VALUES (?, ?, ?)'
    );
    insertStmt.run(email, code, expires_at);

    // Send the verification email
    const emailSent = await sendVerificationCodeEmail(email, code);

    if (emailSent) {
      return NextResponse.json({ message: 'Verification code sent successfully.' });
    } else {
      return NextResponse.json({ message: 'Failed to send verification email.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Send Verification Error:', error);
    return NextResponse.json({ message: 'An error occurred while sending the verification code.' }, { status: 500 });
  }
}
