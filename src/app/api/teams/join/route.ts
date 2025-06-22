
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Team from '@/models/team';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { code } = await req.json();

    if (!code || code.length !== 6) {
      return NextResponse.json({ message: 'A 6-digit team code is required' }, { status: 400 });
    }

    const team = await Team.findOne({ code });

    if (!team) {
      return NextResponse.json({ message: 'Team not found with this code' }, { status: 404 });
    }
    
    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    if (team.members.includes(userId)) {
      return NextResponse.json({ message: 'You are already a member of this team' }, { status: 409 });
    }

    team.members.push(userId);
    await team.save();

    await team.populate({ path: 'members', select: 'email' });

    return NextResponse.json({
      id: team._id.toString(),
      name: team.name,
      code: team.code,
      ownerId: team.ownerId.toString(),
      members: team.members.map((member: any) => member.email),
      createdAt: team.createdAt.getTime(),
    }, { status: 200 });

  } catch (error) {
    console.error('Error joining team:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
