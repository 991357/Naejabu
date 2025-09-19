import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db'; // Using alias for cleaner imports

export async function POST(req: NextRequest) {
  const { name, email, password, nickname } = await req.json();

  if (!name || !email || !password || !nickname) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  if (email !== 'admin') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare(
      'INSERT INTO users (name, email, password_hash, nickname, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const now = new Date().toISOString();
    const result = stmt.run(name, email, hashedPassword, nickname, now, now);

    return NextResponse.json(
      { message: 'User registered successfully', userId: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      if (error.message.includes('email')) {
        return NextResponse.json(
          { message: 'User with this email already exists' },
          { status: 409 }
        );
      }
      if (error.message.includes('nickname')) {
        return NextResponse.json(
          { message: 'This nickname is already taken' },
          { status: 409 }
        );
      }
    }

    console.error('Registration Error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred during registration.' },
      { status: 500 }
    );
  }
}