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

// GET /api/resumes/[id] - Fetch a single resume with its questions
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const resumeId = parseInt(params.id, 10);

        const resumeStmt = db.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?');
        const resume = resumeStmt.get(resumeId, userId);

        if (!resume) {
            return NextResponse.json({ message: 'Resume not found or access denied' }, { status: 404 });
        }

        const questionsStmt = db.prepare('SELECT * FROM resume_questions WHERE resume_id = ?');
        const questions = questionsStmt.all(resumeId);

        return NextResponse.json({ ...resume, questions });

    } catch (error) {
        console.error(`GET /api/resumes/${params.id} Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Transaction for updating a resume and its questions, including versioning
const updateResumeWithQuestions = db.transaction((data) => {
    const { resumeId, userId, company_name, deadline, questions, now } = data;

    // 1. Update the main resume entry
    const updateResumeStmt = db.prepare(
        'UPDATE resumes SET company_name = ?, deadline = ?, updated_at = ? WHERE id = ? AND user_id = ?'
    );
    const result = updateResumeStmt.run(company_name, deadline, now, resumeId, userId);

    if (result.changes === 0) {
        throw new Error('Resume not found or access denied');
    }

    // 2. Create a new version entry
    const createVersionStmt = db.prepare('INSERT INTO resume_versions (resume_id, created_at) VALUES (?, ?)');
    const versionResult = createVersionStmt.run(resumeId, now);
    const versionId = versionResult.lastInsertRowid;

    // 3. Insert all current questions as a snapshot for the new version
    if (questions && questions.length > 0) {
        const insertQuestionVersionStmt = db.prepare(
            'INSERT INTO resume_question_versions (version_id, question_text, answer_text, char_limit) VALUES (?, ?, ?, ?)'
        );
        for (const q of questions) {
            insertQuestionVersionStmt.run(versionId, q.question_text, q.answer_text || '', q.char_limit || 1000);
        }
    }

    // 4. Update the "live" questions
    const deleteQuestionsStmt = db.prepare('DELETE FROM resume_questions WHERE resume_id = ?');
    deleteQuestionsStmt.run(resumeId);

    if (questions && questions.length > 0) {
        const insertQuestionStmt = db.prepare(
            'INSERT INTO resume_questions (resume_id, question_text, answer_text, char_limit) VALUES (?, ?, ?, ?)'
        );
        for (const q of questions) {
            insertQuestionStmt.run(resumeId, q.question_text, q.answer_text || '', q.char_limit || 1000);
        }
    }
    
    return { id: resumeId }; 
});

// PUT /api/resumes/[id] - Update a resume
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const resumeId = parseInt(params.id, 10);
        const body = await req.json();
        const { company_name, deadline, questions } = body;

        if (!company_name || !deadline || !questions) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Check for changes before updating
        const currentResumeStmt = db.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?');
        const currentResume = currentResumeStmt.get(resumeId, userId);

        if (!currentResume) {
            return NextResponse.json({ message: 'Resume not found or access denied' }, { status: 404 });
        }

        const currentQuestionsStmt = db.prepare('SELECT question_text, answer_text, char_limit FROM resume_questions WHERE resume_id = ?');
        const currentQuestions = currentQuestionsStmt.all(resumeId);

        let isChanged = false;
        if (currentResume.company_name !== company_name || currentResume.deadline !== deadline) {
            isChanged = true;
        }

        if (!isChanged) {
            if (questions.length !== currentQuestions.length) {
                isChanged = true;
            } else {
                for (let i = 0; i < questions.length; i++) {
                    const qClient = questions[i];
                    const qDb = currentQuestions[i];
                    if (
                        qClient.question_text !== qDb.question_text ||
                        (qClient.answer_text || '') !== qDb.answer_text ||
                        (qClient.char_limit || 1000) !== qDb.char_limit
                    ) {
                        isChanged = true;
                        break;
                    }
                }
            }
        }

        if (!isChanged) {
            const resQuestions = db.prepare('SELECT * FROM resume_questions WHERE resume_id = ?').all(resumeId);
            return NextResponse.json({ ...currentResume, questions: resQuestions });
        }

        const now = new Date().toISOString();
        updateResumeWithQuestions({ resumeId, userId, company_name, deadline, questions, now });

        // Fetch the updated resume to return it
        const resumeStmt = db.prepare('SELECT * FROM resumes WHERE id = ?');
        const resume = resumeStmt.get(resumeId);

        if (!resume) {
            return NextResponse.json({ message: 'Resume not found' }, { status: 404 });
        }

        const questionsStmt = db.prepare('SELECT * FROM resume_questions WHERE resume_id = ?');
        const updatedQuestions = questionsStmt.all(resumeId);

        return NextResponse.json({ ...resume, questions: updatedQuestions });

    } catch (error: any) {
        console.error(`PUT /api/resumes/${params.id} Error:`, error);
        if (error.message === 'Resume not found or access denied') {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


// DELETE /api/resumes/[id] - Soft delete a resume
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const resumeId = parseInt(params.id, 10);
        const now = new Date().toISOString();

        const stmt = db.prepare(
            'UPDATE resumes SET deleted = 1, deleted_at = ? WHERE id = ? AND user_id = ?'
        );
        const result = stmt.run(now, resumeId, userId);

        if (result.changes === 0) {
            return NextResponse.json({ message: 'Resume not found or access denied' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 }); // No Content

    } catch (error) {
        console.error(`DELETE /api/resumes/${params.id} Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}