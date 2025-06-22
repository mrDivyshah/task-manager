
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Team from '@/models/team';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id } = params;
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }
        
        const team = await Team.findOne({ _id: id, ownerId: session.user.id });

        if (!team) {
            return NextResponse.json({ message: 'Team not found or you are not the owner' }, { status: 404 });
        }

        team.name = name;
        await team.save();

        return NextResponse.json({ id: team._id.toString(), name: team.name }, { status: 200 });

    } catch (error) {
        console.error('Error updating team:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id } = params;

        const result = await Team.deleteOne({ _id: id, ownerId: session.user.id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Team not found or you are not the owner' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('Error deleting team:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
