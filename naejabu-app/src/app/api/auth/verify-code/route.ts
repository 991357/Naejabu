
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ message: 'Email and code are required' }, { status: 400 });
    }

    const stmt = db.prepare('SELECT * FROM email_verifications WHERE email = ? AND code = ?');
    const verification = stmt.get(email, code);

    if (!verification) {
      return NextResponse.json({ message: 'Invalid verification code.' }, { status: 400 });
    }

    const now = new Date();
    const expires_at = new Date(verification.expires_at);

    if (now > expires_at) {
      return NextResponse.json({ message: 'Verification code has expired.' }, { status: 400 });
    }

    // The code is valid, delete it so it can't be used again
    const deleteStmt = db.prepare('DELETE FROM email_verifications WHERE id = ?');
    deleteStmt.run(verification.id);

    return NextResponse.json({ message: 'Email verified successfully.' });

  } catch (error) {
    console.error('Verify Code Error:', error);
    return NextResponse.json({ message: 'An error occurred during email verification.' }, { status: 500 });
  }
}
