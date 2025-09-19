
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';

// 댓글 수정 (PUT)
export async function PUT(request: NextRequest, { params }: { params: { commentId: string } }) {
  const user = getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { commentId } = params;
  const { content } = await request.json();

  if (!content) {
    return NextResponse.json({ message: 'Content is required' }, { status: 400 });
  }

  try {
    const comment = db.prepare('SELECT user_id FROM comments WHERE id = ?').get(commentId) as any;
    if (!comment) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    if (comment.user_id !== user.id && user.is_admin !== 1) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    db.prepare('UPDATE comments SET content = ? WHERE id = ?').run(content, commentId);

    const updatedComment = db.prepare(
        `SELECT c.id, c.content, c.created_at, u.nickname as author_name, u.is_admin as author_is_admin, c.user_id
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`
    ).get(commentId);

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ message: 'Failed to update comment' }, { status: 500 });
  }
}

// 댓글 삭제 (DELETE)
export async function DELETE(request: NextRequest, { params }: { params: { commentId: string } }) {
  const user = getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { commentId } = params;

  try {
    const comment = db.prepare('SELECT user_id FROM comments WHERE id = ?').get(commentId) as any;
    if (!comment) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    if (comment.user_id !== user.id && user.is_admin !== 1) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ message: 'Failed to delete comment' }, { status: 500 });
  }
}
