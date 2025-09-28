
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

interface UserPayload {
    id: number;
    role: string;
}

// Helper function to get user from token
function getUserFromToken(req: NextRequest): UserPayload | null {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
        return null;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret') as UserPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

// GET /api/feedback/mentor-give/pending-requests - Fetch all pending mentoring requests
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    // This endpoint is for mentors only
    if (user.role !== 'mentor') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const stmt = db.prepare(`
      SELECT 
        mr.id as request_id,
        r.company_name,
        u.nickname as mentee_nickname,
        mr.created_at
      FROM mentoring_requests mr
      JOIN resumes r ON mr.resume_id = r.id
      JOIN users u ON mr.mentee_id = u.id
      WHERE mr.status IN ('pending', 'in_progress')
      ORDER BY mr.created_at ASC
    `);
    const requests = stmt.all();

    return NextResponse.json(requests);

  } catch (error) {
    console.error('GET /api/feedback/mentor-give/pending-requests Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
