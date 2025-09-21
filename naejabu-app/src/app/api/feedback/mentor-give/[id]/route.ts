
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

interface UserPayload {
    id: number;
    role: string;
}

function getUserFromToken(req: NextRequest): UserPayload | null {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret') as UserPayload;
    } catch (error) {
        return null;
    }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        if (user.role !== 'mentor') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const requestId = parseInt(params.id, 10);
        if (isNaN(requestId)) {
            return NextResponse.json({ message: 'Invalid request ID' }, { status: 400 });
        }

        // 1. Get request details (joining resume and mentee info)
        const requestStmt = db.prepare(`
            SELECT 
                mr.id as request_id,
                mr.status,
                r.id as resume_id,
                r.company_name,
                r.deadline,
                u.id as mentee_id,
                u.nickname as mentee_nickname
            FROM mentoring_requests mr
            JOIN resumes r ON mr.resume_id = r.id
            JOIN users u ON mr.mentee_id = u.id
            WHERE mr.id = ?
        `);
        const requestDetails = requestStmt.get(requestId);

        if (!requestDetails) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        // 2. Get resume questions and answers
        const questionsStmt = db.prepare('SELECT * FROM resume_questions WHERE resume_id = ?');
        const questions = questionsStmt.all(requestDetails.resume_id);

        // 3. Get existing feedback comments
        const feedbackStmt = db.prepare(`
            SELECT 
                mf.*,
                u.nickname as mentor_nickname
            FROM mentoring_feedback mf
            JOIN users u ON mf.mentor_id = u.id
            WHERE mf.request_id = ?
            ORDER BY mf.created_at ASC
        `);
        const feedback = feedbackStmt.all(requestId);

        return NextResponse.json({ ...requestDetails, questions, feedback });

    } catch (error) {
        console.error(`GET /api/feedback/mentor-give/${params.id} Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        if (user.role !== 'mentor') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const requestId = parseInt(params.id, 10);
        if (isNaN(requestId)) {
            return NextResponse.json({ message: 'Invalid request ID' }, { status: 400 });
        }

        const { comment } = await req.json();
        if (!comment || typeof comment !== 'string' || comment.trim() === '') {
            return NextResponse.json({ message: 'Comment is required' }, { status: 400 });
        }

        const now = new Date().toISOString();

        const transaction = db.transaction(() => {
            // 1. Insert the new feedback
            const feedbackStmt = db.prepare(
                'INSERT INTO mentoring_feedback (request_id, mentor_id, comment, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
            );
            const feedbackResult = feedbackStmt.run(requestId, user.id, comment, now, now);
            const newFeedbackId = feedbackResult.lastInsertRowid;

            // 2. Update request status
            const requestStmt = db.prepare(
                'UPDATE mentoring_requests SET status = ?, updated_at = ? WHERE id = ?'
            );
            requestStmt.run('completed', now, requestId);

            // 3. Create notification for the mentee
            const menteeInfoStmt = db.prepare('SELECT mentee_id FROM mentoring_requests WHERE id = ?');
            const menteeInfo = menteeInfoStmt.get(requestId) as { mentee_id: number };
            if (menteeInfo) {
                const notificationStmt = db.prepare(
                    'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)'
                );
                notificationStmt.run(
                    menteeInfo.mentee_id,
                    'feedback',
                    '멘토 피드백 도착',
                    '신청하신 자기소개서에 멘토의 피드백이 도착했습니다.',
                    `/feedback/results/${requestId}`
                );
            }

            // 4. Fetch the newly created feedback to return it
            const newFeedbackStmt = db.prepare(`
                SELECT 
                    mf.*,
                    u.nickname as mentor_nickname
                FROM mentoring_feedback mf
                JOIN users u ON mf.mentor_id = u.id
                WHERE mf.id = ?
            `);
            return newFeedbackStmt.get(newFeedbackId);
        });

        const newFeedback = transaction();

        return NextResponse.json(newFeedback, { status: 201 });

    } catch (error) {
        console.error(`POST /api/feedback/mentor-give/${params.id} Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
