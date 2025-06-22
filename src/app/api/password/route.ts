
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        return NextResponse.json({ message: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    // Since password has `select: false` in the schema, we must explicitly ask for it
    const user = await User.findById(session.user.id).select('+password');

    if (!user || !user.password) {
      return NextResponse.json({ message: 'User not found or has no password set (e.g., Google sign-in).' }, { status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Incorrect current password.' }, { status: 403 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Password Update Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ message: 'An internal server error occurred.', error: errorMessage }, { status: 500 });
  }
}
