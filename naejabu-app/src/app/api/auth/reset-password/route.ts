import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ message: 'Email and code are required' }, { status: 400 });
    }

    // 1. Verify the code
    const verificationStmt = db.prepare('SELECT * FROM email_verifications WHERE email = ? AND code = ?');
    const verification = verificationStmt.get(email, code);

    if (!verification) {
      return NextResponse.json({ message: 'Invalid verification code' }, { status: 400 });
    }

    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json({ message: 'Verification code has expired' }, { status: 400 });
    }

    // 2. Generate a temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex').slice(0, 8); // 8-char alphanumeric

    // 3. Hash the temporary password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 4. Update user's password and set temp password flag
    const transaction = db.transaction(() => {
        const updateUserStmt = db.prepare('UPDATE users SET password_hash = ?, is_temp_password = 1, updated_at = ? WHERE email = ?');
        const now = new Date().toISOString();
        updateUserStmt.run(hashedPassword, now, email);

        // 5. Delete the verification code
        db.prepare('DELETE FROM email_verifications WHERE id = ?').run(verification.id);
    });
    transaction();

    // 6. Return the temporary password
    return NextResponse.json({ tempPassword });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ message: 'An error occurred while resetting the password.' }, { status: 500 });
  }
}
