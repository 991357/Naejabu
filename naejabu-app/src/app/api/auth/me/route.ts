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

// GET /api/auth/me - Fetch current user's data
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const stmt = db.prepare('SELECT id, email, name, nickname, is_admin, english_name, hanja_name, birthdate, hobby, specialty, motto, is_temp_password, created_at, updated_at FROM users WHERE id = ?');
    const user = stmt.get(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('GET /api/auth/me Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/auth/me - Update user's personal information
export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    // Destructure all possible fields from the body
    const { name, hobby, specialty, motto, birthdate, hanja_name, english_name } = body;

    // First, get the current user data to merge with new data
    const selectStmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const currentUser = selectStmt.get(userId) as any;

    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prepare the data for update, using existing values as fallback
    const updatedUser = {
        name: name ?? currentUser.name,
        hobby: hobby ?? currentUser.hobby,
        specialty: specialty ?? currentUser.specialty,
        motto: motto ?? currentUser.motto,
        birthdate: birthdate ?? currentUser.birthdate,
        hanja_name: hanja_name ?? currentUser.hanja_name,
        english_name: english_name ?? currentUser.english_name,
        updated_at: new Date().toISOString(),
    };

    const updateStmt = db.prepare(
      'UPDATE users SET name = ?, hobby = ?, specialty = ?, motto = ?, birthdate = ?, hanja_name = ?, english_name = ?, updated_at = ? WHERE id = ?'
    );

    const result = updateStmt.run(
        updatedUser.name,
        updatedUser.hobby,
        updatedUser.specialty,
        updatedUser.motto,
        updatedUser.birthdate,
        updatedUser.hanja_name,
        updatedUser.english_name,
        updatedUser.updated_at,
        userId
    );

    if (result.changes === 0) {
        return NextResponse.json({ message: 'User not found or data is the same' }, { status: 404 });
    }

    // Fetch the fully updated user to return
    const returnStmt = db.prepare('SELECT id, email, name, english_name, hanja_name, birthdate, hobby, specialty, motto, created_at, updated_at FROM users WHERE id = ?');
    const finalUser = returnStmt.get(userId);

    return NextResponse.json(finalUser);

  } catch (error) {
    console.error('PATCH /api/auth/me Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}