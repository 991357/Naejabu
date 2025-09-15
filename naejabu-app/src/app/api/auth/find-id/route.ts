import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
    }

    const stmt = db.prepare('SELECT email FROM users WHERE name = ? AND email = ?');
    const user = stmt.get(name, email);

    if (user) {
      return NextResponse.json({ email: user.email });
    } else {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Find ID Error:', error);
    return NextResponse.json({ message: 'An error occurred while finding the ID.' }, { status: 500 });
  }
}
