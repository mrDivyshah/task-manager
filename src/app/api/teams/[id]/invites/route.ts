
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Team from '@/models/team';
import User from '@/models/user';
import Notification from '@/models/notification';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.name) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id: teamId } = params;
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return NextResponse.json({ message: 'Team not found' }, { status: 404 });
        }

        if (team.ownerId.toString() !== session.user.id) {
            return NextResponse.json({ message: 'You are not authorized to invite members to this team' }, { status: 403 });
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            return NextResponse.json({ message: `User with email "${email}" not found` }, { status: 404 });
        }

        if (team.members.some(memberId => memberId.equals(userToInvite._id)) || team.pendingRequests.some(reqId => reqId.equals(userToInvite._id))) {
            return NextResponse.json({ message: 'User is already a member or has a pending request' }, { status: 409 });
        }

        // Check if an invite notification already exists for this user and team
        const existingNotification = await Notification.findOne({
            userId: userToInvite._id,
            'data.teamId': team._id,
            type: 'TEAM_INVITE',
        });

        if (existingNotification) {
            return NextResponse.json({ message: 'An invitation has already been sent to this user' }, { status: 409 });
        }

        const newNotification = new Notification({
            userId: userToInvite._id,
            type: 'TEAM_INVITE',
            message: `${session.user.name} has invited you to join the team "${team.name}"`,
            data: {
                teamId: team._id,
                teamName: team.name,
                invitingUserId: session.user.id,
            },
        });
        await newNotification.save();

        return NextResponse.json({ message: 'Invitation sent successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error sending invitation:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
