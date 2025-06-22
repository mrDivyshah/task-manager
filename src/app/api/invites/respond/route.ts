
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Team from '@/models/team';
import Notification from '@/models/notification';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { notificationId, action } = await req.json(); // action: 'accept' or 'reject'

    if (!notificationId || !action) {
      return NextResponse.json({ message: 'Missing required fields: notificationId and action' }, { status: 400 });
    }
    
    const notification = await Notification.findById(notificationId);

    if (!notification || notification.userId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Notification not found or you are not authorized to act on it' }, { status: 404 });
    }
    
    if (notification.type !== 'TEAM_INVITE') {
        return NextResponse.json({ message: 'This is not a team invite notification' }, { status: 400 });
    }

    if (action === 'accept') {
      const teamId = notification.data.teamId;
      const team = await Team.findById(teamId);
      if (team) {
        const userObjectId = new mongoose.Types.ObjectId(session.user.id);
        // Add user to members if not already a member
        if (!team.members.includes(userObjectId)) {
          team.members.push(userObjectId);
          await team.save();
        }
      }
    }
    
    // For both accept and reject, we delete the notification
    await Notification.deleteOne({ _id: notificationId });

    return NextResponse.json({ message: `Invitation has been ${action === 'accept' ? 'accepted' : 'rejected'}` }, { status: 200 });

  } catch (error) {
    console.error(`Error handling invitation response:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
