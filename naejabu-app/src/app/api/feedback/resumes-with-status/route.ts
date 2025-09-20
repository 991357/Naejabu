
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

// Helper function to get user ID from token
function getUserIdFromToken(req: NextRequest): number | null {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
        return null;
    }
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
        return decoded.id;
    } catch (error) {
        return null;
    }
}

// GET /api/feedback/resumes-with-status - Fetch all resumes for the current user with their mentoring status
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const stmt = db.prepare(`
      SELECT 
        r.*, 
        mr.status as mentoring_status,
        (SELECT COUNT(*) FROM mentoring_feedback mf WHERE mf.request_id = mr.id) as feedback_count
      FROM resumes r
      LEFT JOIN mentoring_requests mr ON r.id = mr.resume_id
      WHERE r.user_id = ? AND r.deleted = 0
      ORDER BY r.updated_at DESC
    `);
    const resumes = stmt.all(userId);

    return NextResponse.json(resumes);

  } catch (error) {
    console.error('GET /api/feedback/resumes-with-status Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
