
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/task';
import User from '@/models/user';
import Team from '@/models/team';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id } = params;
        const body = await req.json();

        const task = await Task.findOne({ _id: id, userId: session.user.id });

        if (!task) {
            return NextResponse.json({ message: 'Task not found or you do not have permission to edit it' }, { status: 404 });
        }

        const { title, notes, priority, teamId, assignedTo, category } = body;
        
        task.title = title ?? task.title;
        task.notes = notes ?? task.notes;
        task.priority = (priority === 'none' || priority === '') ? undefined : (priority ?? task.priority);
        task.teamId = (teamId === '__none__' || teamId === "") ? undefined : (teamId ?? task.teamId);
        task.assignedTo = (assignedTo === '__none__' || assignedTo === "") ? undefined : (assignedTo ?? task.assignedTo);
        
        if (category !== undefined) {
          task.category = category;
        }
        
        await task.save();
        await task.populate([
            { path: 'teamId', model: Team, select: 'name' },
            { path: 'assignedTo', model: User, select: 'name email' }
        ]);
        const taskObject = task.toObject();
        
        const teamData = taskObject.teamId as any;
        const assignedToData = taskObject.assignedTo as any;

        return NextResponse.json({
            ...taskObject,
            id: task._id.toString(),
            createdAt: task.createdAt.getTime(),
            team: teamData ? { name: teamData.name } : undefined,
            assignedTo: assignedToData ? { id: assignedToData._id.toString(), name: assignedToData.name, email: assignedToData.email } : undefined,
            teamId: teamData?._id.toString(),
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating task:', error);
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

        const result = await Task.deleteOne({ _id: id, userId: session.user.id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Task not found or you do not have permission to delete it' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

    