import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// 특정 게시글 조회 (GET)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const stmt = db.prepare(`
      SELECT p.*, p.is_pinned, u.is_admin as author_is_admin, 
             CASE WHEN u.is_admin = 1 THEN '관리자' ELSE u.nickname END as author_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `);
    const post = stmt.get(params.id);

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ message: 'Error fetching post' }, { status: 500 });
  }
}

// 게시글 수정 (PUT)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { title, content, category } = await req.json();
  if (!title || !content || !category) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  // 권한 체크
  if ((category === 'jobs' || category === 'notice') && user.is_admin !== 1) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const postStmt = db.prepare('SELECT user_id FROM posts WHERE id = ?');
    const post = postStmt.get(params.id) as any;

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (post.user_id !== user.id && user.is_admin !== 1) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const stmt = db.prepare(
      'UPDATE posts SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    stmt.run(title, content, category, params.id);

    return NextResponse.json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ message: 'Error updating post' }, { status: 500 });
  }
}

// 게시글 삭제 (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const postStmt = db.prepare('SELECT user_id FROM posts WHERE id = ?');
    const post = postStmt.get(params.id) as any;

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (post.user_id !== user.id && user.is_admin !== 1) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
    stmt.run(params.id);

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ message: 'Error deleting post' }, { status: 500 });
  }
}
