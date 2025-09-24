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

// GET /api/resumes/[id]/versions - Fetch all versions for a resume
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const resumeId = parseInt(params.id, 10);

        // First, verify the user owns the resume
        const resumeStmt = db.prepare('SELECT user_id FROM resumes WHERE id = ?');
        const resume = resumeStmt.get(resumeId);

        if (!resume || resume.user_id !== userId) {
            return NextResponse.json({ message: 'Resume not found or access denied' }, { status: 404 });
        }

        // Fetch all versions for the given resume_id, ordered by most recent first
        const versionsStmt = db.prepare('SELECT id, created_at FROM resume_versions WHERE resume_id = ? ORDER BY created_at DESC');
        const versions = versionsStmt.all(resumeId);

        return NextResponse.json(versions);

    } catch (error) {
        console.error(`GET /api/resumes/${params.id}/versions Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
