import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db'; // Using alias for cleaner imports

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare(
      'INSERT INTO users (name, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    );

    const now = new Date().toISOString();
    const result = stmt.run(name, email, hashedPassword, now, now);

    return NextResponse.json(
      { message: 'User registered successfully', userId: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    console.error('Registration Error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration.' },
      { status: 500 }
    );
  }
}