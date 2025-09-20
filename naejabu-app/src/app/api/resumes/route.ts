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

// GET /api/resumes - Fetch all resumes for the current user
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const stmt = db.prepare('SELECT * FROM resumes WHERE user_id = ? AND deleted = 0 ORDER BY updated_at DESC');
    const resumes = stmt.all(userId);

    return NextResponse.json(resumes);

  } catch (error) {
    console.error('GET /api/resumes Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/resumes - Create a new resume
const createResumeWithQuestions = db.transaction((resumeData) => {
    const { userId, company_name, deadline, questions, now } = resumeData;

    const resumeStmt = db.prepare(
        'INSERT INTO resumes (user_id, company_name, deadline, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    );
    const resumeResult = resumeStmt.run(userId, company_name, deadline, now, now);
    const resumeId = resumeResult.lastInsertRowid;

    if (questions && questions.length > 0) {
        const questionStmt = db.prepare(
            'INSERT INTO resume_questions (resume_id, question_text, answer_text, char_limit) VALUES (?, ?, ?, ?)'
        );
        for (const q of questions) {
            questionStmt.run(resumeId, q.question_text, '', q.char_limit || 1000); 
        }
    }
    return resumeId;
});

export async function POST(req: NextRequest) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const body = await req.json();
        const { company_name, deadline, questions } = body;

        if (!company_name || !deadline || !questions) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const newResumeId = createResumeWithQuestions({ userId, company_name, deadline, questions, now });

        const newResumeStmt = db.prepare('SELECT * FROM resumes WHERE id = ?');
        const newResume = newResumeStmt.get(newResumeId);

        return NextResponse.json(newResume, { status: 201 });

    } catch (error) {
        console.error('POST /api/resumes Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}