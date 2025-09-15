import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

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

export async function POST(req: NextRequest) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Current and new passwords are required' }, { status: 400 });
        }

        // Fetch user from DB
        const userStmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = userStmt.get(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return NextResponse.json({ message: 'Incorrect current password' }, { status: 403 });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        const updateStmt = db.prepare('UPDATE users SET password_hash = ?, is_temp_password = 0, updated_at = ? WHERE id = ?');
        const now = new Date().toISOString();
        updateStmt.run(hashedNewPassword, now, userId);

        return NextResponse.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Change Password Error:', error);
        return NextResponse.json({ message: 'An error occurred while changing the password.' }, { status: 500 });
    }
}
