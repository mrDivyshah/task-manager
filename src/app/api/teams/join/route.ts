
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Team from '@/models/team';
import Notification from '@/models/notification';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.name) {
    return NextResponse.json({ message: 'Not authenticated or user name is missing' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { code } = await req.json();

    if (!code || code.length !== 6) {
      return NextResponse.json({ message: 'A 6-character team code is required' }, { status: 400 });
    }

    const team = await Team.findOne({ code });

    if (!team) {
      return NextResponse.json({ message: 'Team not found with this code' }, { status: 404 });
    }
    
    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    if (team.members.includes(userId)) {
      return NextResponse.json({ message: 'You are already a member of this team' }, { status: 409 });
    }

    if (team.pendingRequests.includes(userId)) {
        return NextResponse.json({ message: 'You have already sent a request to join this team' }, { status: 409 });
    }
    
    // Add user to pending requests instead of directly to members
    team.pendingRequests.push(userId);
    await team.save();

    // Create a notification for the team owner
    const newNotification = new Notification({
      userId: team.ownerId,
      type: 'JOIN_REQUEST',
      message: `${session.user.name} wants to join your team "${team.name}"`,
      data: {
        teamId: team._id,
        teamName: team.name,
        requestingUserId: userId,
        requestingUserName: session.user.name,
      }
    });
    await newNotification.save();

    return NextResponse.json({ message: 'Your request to join the team has been sent.' }, { status: 200 });

  } catch (error) {
    console.error('Error sending join request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
