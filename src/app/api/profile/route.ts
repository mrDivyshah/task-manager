
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { name, gender } = await req.json();

    if (!name || !gender) {
      return NextResponse.json({ message: 'Name and gender are required' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { name, gender },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', user: { name: updatedUser.name, gender: updatedUser.gender } }, { status: 200 });

  } catch (error) {
    console.error('Profile Update Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ message: 'An internal server error occurred.', error: errorMessage }, { status: 500 });
  }
}
