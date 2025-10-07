import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
// import Filter from 'bad-words';

// const filter = new Filter();

const badWords = ['바보', '멍청이', '쓰레기', '개새끼', '씨발', '병신']; // 간단한 비속어 목록

export async function PUT(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { nickname } = await req.json();

  if (!nickname || nickname.length < 2) {
    return NextResponse.json({ message: '닉네임은 2자 이상이어야 합니다.' }, { status: 400 });
  }

  // 비속어 필터링
  if (badWords.some(word => nickname.includes(word))) {
    return NextResponse.json({ message: '닉네임에 부적절한 단어가 포함되어 있습니다.' }, { status: 400 });
  }

  try {
    // 닉네임 중복 확인
    const existingUser = db.prepare('SELECT id FROM users WHERE nickname = ? AND id != ?').get(nickname, user.id);
    if (existingUser) {
      return NextResponse.json({ message: '이미 사용중인 닉네임입니다.' }, { status: 409 });
    }

    const stmt = db.prepare('UPDATE users SET nickname = ? WHERE id = ?');
    stmt.run(nickname, user.id);

    const updatedUserStmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const updatedUser = updatedUserStmt.get(user.id) as any;

    const token = jwt.sign(
      { id: updatedUser.id, name: updatedUser.name, role: updatedUser.role },
      process.env.JWT_SECRET || 'your-default-secret'
    );

    return NextResponse.json({ message: 'Nickname updated successfully', token });
  } catch (error: any) {
    console.error('Nickname Change Error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred during nickname change.' },
      { status: 500 }
    );
  }
}
