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

// PUT /api/resumes/[id]/restore - Restore a soft-deleted resume
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const resumeId = parseInt(params.id, 10);

        const stmt = db.prepare(
            'UPDATE resumes SET deleted = 0, deleted_at = NULL WHERE id = ? AND user_id = ? AND deleted = 1'
        );
        const result = stmt.run(resumeId, userId);

        if (result.changes === 0) {
            return NextResponse.json({ message: 'Resume not found in trash or access denied' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Resume restored successfully' });

    } catch (error) {
        console.error(`PUT /api/resumes/${params.id}/restore Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
