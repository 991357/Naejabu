import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as any;

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (isPasswordValid) {
        const token = jwt.sign(
          { id: user.id, name: user.name },
          process.env.JWT_SECRET || 'your-default-secret',
          { expiresIn: '1h' }
        );
        return NextResponse.json({ token });
      }
    }

    // If user is not found or password is not valid, return the same error for security.
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login.' },
      { status: 500 }
    );
  }
}
