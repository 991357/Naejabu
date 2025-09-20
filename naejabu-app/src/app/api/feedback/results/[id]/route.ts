
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

interface UserPayload {
    id: number;
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const requestId = parseInt(params.id, 10);
        if (isNaN(requestId)) {
            return NextResponse.json({ message: 'Invalid request ID' }, { status: 400 });
        }

        // 1. Get request details and verify ownership
        const requestStmt = db.prepare(`
            SELECT 
                mr.id as request_id,
                mr.status,
                mr.mentee_id,
                r.id as resume_id,
                r.company_name,
                r.deadline
            FROM mentoring_requests mr
            JOIN resumes r ON mr.resume_id = r.id
            WHERE mr.id = ?
        `);
        const requestDetails = requestStmt.get(requestId) as any;

        if (!requestDetails) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        // Authorization check: user must be the mentee who made the request
        if (requestDetails.mentee_id !== userId) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // 2. Get resume questions and answers
        const questionsStmt = db.prepare('SELECT * FROM resume_questions WHERE resume_id = ?');
        const questions = questionsStmt.all(requestDetails.resume_id);

        // 3. Get feedback comments
        const feedbackStmt = db.prepare(`
            SELECT 
                mf.id,
                mf.comment,
                mf.created_at,
                u.nickname as mentor_nickname
            FROM mentoring_feedback mf
            JOIN users u ON mf.mentor_id = u.id
            WHERE mf.request_id = ?
            ORDER BY mf.created_at ASC
        `);
        const feedback = feedbackStmt.all(requestId);

        return NextResponse.json({ ...requestDetails, questions, feedback });

    } catch (error) {
        console.error(`GET /api/feedback/results/${params.id} Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/feedback/results/[id] - Cancel a mentoring request
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const requestId = parseInt(params.id, 10);
        if (isNaN(requestId)) {
            return NextResponse.json({ message: 'Invalid request ID' }, { status: 400 });
        }

        // Verify the request belongs to the user and is pending
        const requestStmt = db.prepare('SELECT * FROM mentoring_requests WHERE id = ?');
        const request = requestStmt.get(requestId) as any;

        if (!request) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        if (request.mentee_id !== userId) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        if (request.status !== 'pending' && request.status !== 'completed') {
            return NextResponse.json({ message: 'Only pending or completed requests can be canceled' }, { status: 400 });
        }

        // Update status to 'canceled'
        const updateStmt = db.prepare('UPDATE mentoring_requests SET status = ?, updated_at = ? WHERE id = ?');
        const now = new Date().toISOString();
        updateStmt.run('canceled', now, requestId);

        return NextResponse.json({ message: 'Request canceled successfully' });

    } catch (error) {
        console.error(`PATCH /api/feedback/results/${params.id} Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
