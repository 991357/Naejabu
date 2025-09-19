import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const categories = ['notice', 'general', 'jobs', 'inquiry'];
  const postsByCategory: { [key: string]: any[] } = {};

  try {
    for (const category of categories) {
      const stmt = db.prepare(`
        SELECT p.id, p.title, p.created_at, 
               CASE WHEN u.is_admin = 1 THEN '관리자' ELSE u.nickname END as author_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.category = ?
        ORDER BY p.is_pinned DESC, p.created_at DESC
        LIMIT 5
      `);
      const posts = stmt.all(category);
      postsByCategory[category] = posts;
    }
    return NextResponse.json(postsByCategory);
  } catch (error) {
    console.error('Error fetching latest posts by category:', error);
    return NextResponse.json({ message: 'Error fetching posts' }, { status: 500 });
  }
}
