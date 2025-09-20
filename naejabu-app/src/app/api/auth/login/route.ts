import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: '이메일과 비밀번호를 모두 입력해주세요.' }, { status: 400 });
  }

  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as any;

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (isPasswordValid) {
        const token = jwt.sign(
          { id: user.id, name: user.name, role: user.role },
          process.env.JWT_SECRET || 'your-default-secret'
        );
        return NextResponse.json({ token });
      }
    }

    // If user is not found or password is not valid, return the same error for security.
    return NextResponse.json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });

  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { message: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
