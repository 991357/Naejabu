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
    // First, check the post category and get author
    const post = db.prepare('SELECT user_id, category FROM posts WHERE id = ?').get(postId) as { user_id: number, category: string };
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

    // Notify post author about the new comment
    console.log(`Checking to notify. Post author: ${post.user_id}, Commenter: ${userId}`);
    if (post.user_id !== userId) {
        console.log('Condition met. Creating notification...');
        db.prepare(
            'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)'
        ).run(
            post.user_id,
            'comment',
            '새로운 댓글 알림',
            `회원님의 게시글에 새로운 댓글이 달렸습니다.`,
            `/community/post/${postId}`
        );
        console.log('Notification created.');
    } else {
        console.log('Condition not met. User commented on their own post.');
    }

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