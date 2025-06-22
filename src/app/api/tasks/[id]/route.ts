
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/task';

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

        const { title, notes, priority, teamId, category } = body;
        
        task.title = title ?? task.title;
        task.notes = notes ?? task.notes;
        task.priority = (priority === 'none' || priority === '') ? undefined : (priority ?? task.priority);
        task.teamId = (teamId === '__none__' || teamId === "") ? undefined : (teamId ?? task.teamId);
        if (category !== undefined) {
          task.category = category;
        }
        
        const updatedTask = await task.save();
        const taskObject = updatedTask.toObject();

        return NextResponse.json({
             ...taskObject,
            id: updatedTask._id.toString(),
            createdAt: updatedTask.createdAt.getTime(),
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
