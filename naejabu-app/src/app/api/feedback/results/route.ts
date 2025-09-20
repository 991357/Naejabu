
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

interface UserPayload {
    id: number;
    role: string;
}

function getUserIdFromToken(req: NextRequest): number | null {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret') as UserPayload;
        return decoded.id;
    } catch (error) {
        return null;
    }
}

// GET /api/feedback/results - Fetch all of a mentee's own requests
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const stmt = db.prepare(`
        SELECT 
            mr.id as request_id,
            mr.status,
            mr.created_at,
            r.company_name,
            (SELECT COUNT(*) FROM mentoring_feedback mf WHERE mf.request_id = mr.id) as feedback_count
        FROM mentoring_requests mr
        JOIN resumes r ON mr.resume_id = r.id
        WHERE mr.mentee_id = ?
        ORDER BY mr.created_at DESC
    `);
    const requests = stmt.all(userId);

    return NextResponse.json(requests);

  } catch (error) {
    console.error('GET /api/feedback/results Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
