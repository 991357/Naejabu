import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const postId = params.id;

  try {
    const comments = db.prepare(
      `SELECT c.id, c.content, c.created_at, u.nickname as author_name, u.is_admin as author_is_admin, c.user_id
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`
    ).all(postId);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ message: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const postId = params.id;
  const { content } = await request.json();
  const userId = user.id;

  if (!content) {
    return NextResponse.json({ message: 'Content is required' }, { status: 400 });
  }

  try {
    // First, check the post category
    const post = db.prepare('SELECT category FROM posts WHERE id = ?').get(postId) as any;
    if (!post) {
        return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // If category is 'inquiry', only admin can comment
    if (post.category === 'inquiry' && user.is_admin !== 1) {
        return NextResponse.json({ message: 'Only admins can reply to inquiries.' }, { status: 403 });
    }

    const result = db.prepare(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)'
    ).run(postId, userId, content);

    const newCommentId = result.lastInsertRowid;
    const newComment = db.prepare(
        `SELECT c.id, c.content, c.created_at, u.nickname as author_name, u.is_admin as author_is_admin, c.user_id
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`
    ).get(newCommentId);

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ message: 'Failed to create comment' }, { status: 500 });
  }
}