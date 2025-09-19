import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

interface UserPayload {
  id: number;
  name: string;
}

export const getCurrentUser = (req: NextRequest) => {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret') as UserPayload;
    
    const userStmt = db.prepare('SELECT id, name, nickname, is_admin FROM users WHERE id = ?');
    const user = userStmt.get(decoded.id);

    return user || null;
  } catch (error) {
    console.error("Auth Error:", error);
    return null;
  }
};
