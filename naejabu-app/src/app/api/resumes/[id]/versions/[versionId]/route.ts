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

// GET /api/resumes/[id]/versions/[versionId] - Fetch a specific version's content
export async function GET(req: NextRequest, { params }: { params: { id: string, versionId: string } }) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const resumeId = parseInt(params.id, 10);
        const versionId = parseInt(params.versionId, 10);

        // Verify the user owns the resume this version belongs to
        const authStmt = db.prepare(`
            SELECT r.user_id 
            FROM resumes r
            JOIN resume_versions rv ON r.id = rv.resume_id
            WHERE rv.id = ? AND r.id = ?
        `);
        const owner = authStmt.get(versionId, resumeId);

        if (!owner || owner.user_id !== userId) {
            return NextResponse.json({ message: 'Version not found or access denied' }, { status: 404 });
        }

        // Fetch the questions for the specific version
        const questionsStmt = db.prepare('SELECT question_text, answer_text, char_limit FROM resume_question_versions WHERE version_id = ?');
        const questions = questionsStmt.all(versionId);

        return NextResponse.json({ questions });

    } catch (error) {
        console.error(`GET /api/resumes/${params.id}/versions/${params.versionId} Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


// DELETE /api/resumes/[id]/versions/[versionId] - Delete a specific version
export async function DELETE(req: NextRequest, { params }: { params: { id: string, versionId: string } }) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const resumeId = parseInt(params.id, 10);
        const versionId = parseInt(params.versionId, 10);

        // 1. Verify user ownership
        const authStmt = db.prepare(`
            SELECT r.user_id 
            FROM resumes r
            JOIN resume_versions rv ON r.id = rv.resume_id
            WHERE rv.id = ? AND r.id = ?
        `);
        const owner = authStmt.get(versionId, resumeId);

        if (!owner || owner.user_id !== userId) {
            return NextResponse.json({ message: 'Version not found or access denied' }, { status: 404 });
        }

        // 2. Check if it's the last version
        const countStmt = db.prepare('SELECT COUNT(*) as count FROM resume_versions WHERE resume_id = ?');
        const { count } = countStmt.get(resumeId);

        if (count <= 1) {
            return NextResponse.json({ message: '마지막 버전은 삭제할 수 없습니다.' }, { status: 400 });
        }

        // 3. Delete the version in a transaction
        const deleteTransaction = db.transaction(() => {
            const deleteQuestionsStmt = db.prepare('DELETE FROM resume_question_versions WHERE version_id = ?');
            deleteQuestionsStmt.run(versionId);

            const deleteVersionStmt = db.prepare('DELETE FROM resume_versions WHERE id = ?');
            deleteVersionStmt.run(versionId);
        });

        deleteTransaction();

        return new NextResponse(null, { status: 204 }); // No Content

    } catch (error) {
        console.error(`DELETE /api/resumes/${params.id}/versions/${params.versionId} Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
