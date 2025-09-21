
import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  try {
    const stmt = db.prepare(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?'
    );
    stmt.run(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
