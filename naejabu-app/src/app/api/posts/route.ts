import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sendMail } from '@/lib/email';

// 게시글 목록 조회 (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const query = searchParams.get('query');

  try {
    let sql = `
      SELECT p.id, p.title, p.category, p.created_at, p.is_pinned, 
             CASE WHEN u.is_admin = 1 THEN '관리자' ELSE u.nickname END as author_name,
             (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      sql += ' WHERE p.category = ?';
      params.push(category);
    }

    if (query) {
      sql += `${params.length > 0 ? ' AND' : ' WHERE'} (p.title LIKE ? OR p.content LIKE ?)`;
      params.push(`%${query}%`, `%${query}%`);
    }

    sql += ' ORDER BY p.is_pinned DESC, p.created_at DESC';

    // Get total count for numbering
    let countSql = 'SELECT COUNT(*) as count FROM posts';
    const countParams: any[] = [];
    if (category && category !== 'all') {
      countSql += ' WHERE category = ?';
      countParams.push(category);
    }
    const totalCount = db.prepare(countSql).get(countParams).count;

    const stmt = db.prepare(sql);
    const posts = stmt.all(params);
    return NextResponse.json({ posts, totalCount });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ message: 'Error fetching posts' }, { status: 500 });
  }
}

// 새 게시글 생성 (POST)
export async function POST(req: NextRequest) {
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
    const stmt = db.prepare(
      'INSERT INTO posts (user_id, title, content, category) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(user.id, title, content, category);

    // 문의 또는 건의사항일 경우 이메일 발송
    if (category === 'inquiry' || category === 'suggestion') {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendMail({
          to: adminEmail,
          subject: `[내자부] 새로운 ${category === 'inquiry' ? '문의' : '건의'} 도착: ${title}`,
          html: `
            <h1>새로운 ${category === 'inquiry' ? '문의' : '건의'}가 도착했습니다.</h1>
            <p><strong>작성자:</strong> ${user.name} (${user.nickname})</p>
            <p><strong>제목:</strong> ${title}</p>
            <hr>
            <p><strong>내용:</strong></p>
            <div style="white-space: pre-wrap; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">${content}</div>
          `,
        });
      }
    }

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ message: 'Error creating post' }, { status: 500 });
  }
}
