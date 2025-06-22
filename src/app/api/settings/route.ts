
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
    const body = await req.json();

    const { notificationSoundEnabled, notificationStyle, advancedFeaturesEnabled } = body;

    const fieldsToUpdate: any = {};
    if (notificationSoundEnabled !== undefined) fieldsToUpdate.notificationSoundEnabled = notificationSoundEnabled;
    if (notificationStyle) fieldsToUpdate.notificationStyle = notificationStyle;
    if (advancedFeaturesEnabled !== undefined) fieldsToUpdate.advancedFeaturesEnabled = advancedFeaturesEnabled;

    if (Object.keys(fieldsToUpdate).length === 0) {
        return NextResponse.json({ message: 'No settings provided to update' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: fieldsToUpdate },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Settings updated successfully', settings: fieldsToUpdate }, { status: 200 });

  } catch (error) {
    console.error('Settings Update Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ message: 'An internal server error occurred.', error: errorMessage }, { status: 500 });
  }
}
