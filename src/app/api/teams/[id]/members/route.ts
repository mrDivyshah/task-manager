
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Team from '@/models/team';
import User from '@/models/user';
import mongoose from 'mongoose';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid team ID' }, { status: 400 });
        }

        const team = await Team.findById(id).populate({
            path: 'members',
            model: User,
            select: 'name email'
        });

        if (!team) {
            return NextResponse.json({ message: 'Team not found' }, { status: 404 });
        }

        // Check if the current user is a member of the team
        const isMember = team.members.some((member: any) => member._id.toString() === session.user.id);
        if (!isMember) {
            return NextResponse.json({ message: 'You are not a member of this team' }, { status: 403 });
        }

        const formattedMembers = team.members.map((member: any) => ({
            id: member._id.toString(),
            name: member.name,
            email: member.email,
        }));

        return NextResponse.json(formattedMembers, { status: 200 });

    } catch (error) {
        console.error('Error fetching team members:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

    