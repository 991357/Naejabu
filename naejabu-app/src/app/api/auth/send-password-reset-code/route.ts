import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendVerificationCodeEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // 1. Check if user exists
    const userStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const user = userStmt.get(email);

    if (!user) {
      // To prevent user enumeration, we send a generic success response even if the user doesn't exist.
      console.log(`Password reset requested for non-existent user: ${email}`);
      return NextResponse.json({ message: 'If an account with that email exists, a verification code has been sent.' });
    }

    // 2. Generate a 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    // 3. Store the code in the database
    const transaction = db.transaction(() => {
      // Delete any old codes for this email
      db.prepare('DELETE FROM email_verifications WHERE email = ?').run(email);
      // Insert the new code
      db.prepare('INSERT INTO email_verifications (email, code, expires_at) VALUES (?, ?, ?)').run(email, code, expires_at);
    });
    transaction();

    // 4. Send the email
    // We don't wait for the email to be sent to respond, to make the user experience faster.
    // The actual sending happens in the background.
    sendVerificationCodeEmail(email, code).catch(console.error);

    return NextResponse.json({ message: 'If an account with that email exists, a verification code has been sent.' });

  } catch (error) {
    console.error('Send Password Reset Code Error:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
