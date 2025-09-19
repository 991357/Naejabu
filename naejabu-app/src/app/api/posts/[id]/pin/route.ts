import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// 게시글 고정/고정 해제 (PUT)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getCurrentUser(req);

  // 1. 관리자 권한 확인
  if (!user || user.is_admin !== 1) {
    return NextResponse.json({ message: '권한이 없습니다.' }, { status: 403 });
  }

  const postId = params.id;

  try {
    // 2. 현재 게시글의 is_pinned 상태 확인
    const postStmt = db.prepare('SELECT is_pinned FROM posts WHERE id = ?');
    const post = postStmt.get(postId) as { is_pinned: number | null };

    if (!post) {
      return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 3. is_pinned 상태 토글 (0 -> 1, 1 -> 0)
    const newIsPinned = post.is_pinned === 1 ? 0 : 1;

    // 4. 데이터베이스 업데이트
    const updateStmt = db.prepare('UPDATE posts SET is_pinned = ? WHERE id = ?');
    updateStmt.run(newIsPinned, postId);

    // 5. 새로운 상태 반환
    return NextResponse.json({ is_pinned: newIsPinned });

  } catch (error) {
    console.error(`Error toggling pin for post ${postId}:`, error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}