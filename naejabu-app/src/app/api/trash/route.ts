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

const cleanupAndFetchTrash = db.transaction((userId) => {
    // Permanently delete items that have been in the trash for over 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    const cleanupStmt = db.prepare(
        'UPDATE resumes SET deleted = 2 WHERE user_id = ? AND deleted = 1 AND deleted_at <= ?'
    );
    cleanupStmt.run(userId, sevenDaysAgoISO);

    // Fetch remaining items in the trash
    const fetchStmt = db.prepare(
        'SELECT * FROM resumes WHERE user_id = ? AND deleted = 1 ORDER BY deleted_at DESC'
    );
    const trashedResumes = fetchStmt.all(userId);
    
    return trashedResumes;
});

// GET /api/trash - Fetch all trashed resumes for the current user
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const trashedResumes = cleanupAndFetchTrash(userId);

    return NextResponse.json(trashedResumes);

  } catch (error) {
    console.error('GET /api/trash Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
