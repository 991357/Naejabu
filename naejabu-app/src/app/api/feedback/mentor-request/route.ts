
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

// POST /api/feedback/mentor-request - Create a new mentor feedback request
export async function POST(req: NextRequest) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const body = await req.json();
        const { resume_id } = body;

        if (!resume_id) {
            return NextResponse.json({ message: 'Resume ID is required' }, { status: 400 });
        }

        const now = new Date().toISOString();

        // Check for a previously canceled request for the same resume
        const canceledRequestStmt = db.prepare("SELECT * FROM mentoring_requests WHERE resume_id = ? AND status = 'canceled'");
        const canceledRequest = canceledRequestStmt.get(resume_id) as any;

        if (canceledRequest) {
            // If found, reuse it by updating its status back to 'pending'
            const updateStmt = db.prepare("UPDATE mentoring_requests SET status = ?, updated_at = ? WHERE id = ?");
            updateStmt.run('pending', now, canceledRequest.id);

            const updatedRequestStmt = db.prepare('SELECT * FROM mentoring_requests WHERE id = ?');
            const updatedRequest = updatedRequestStmt.get(canceledRequest.id);
            
            return NextResponse.json(updatedRequest, { status: 200 }); // Return 200 OK as we updated an existing resource
        }

        // If no canceled request, check if an active request already exists
        const activeRequestStmt = db.prepare("SELECT * FROM mentoring_requests WHERE resume_id = ? AND status IN ('pending', 'completed')");
        const activeRequest = activeRequestStmt.get(resume_id);

        if (activeRequest) {
            return NextResponse.json({ message: '이미 첨삭 요청이 등록되었거나 완료된 이력서입니다.' }, { status: 409 });
        }

        // If no active or canceled request exists, create a new one
        const insertStmt = db.prepare(
            'INSERT INTO mentoring_requests (resume_id, mentee_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
        );
        const result = insertStmt.run(resume_id, userId, 'pending', now, now);
        
        const newRequestId = result.lastInsertRowid;
        const newRequestStmt = db.prepare('SELECT * FROM mentoring_requests WHERE id = ?');
        const newRequest = newRequestStmt.get(newRequestId);

        return NextResponse.json(newRequest, { status: 201 });

    } catch (error) {
        console.error('POST /api/feedback/mentor-request Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
