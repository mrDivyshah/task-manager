
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/task';
import User from '@/models/user';
import Team from '@/models/team';
import Notification from '@/models/notification';
import { format } from 'date-fns';

async function checkTaskPermission(taskId: string, userId: string): Promise<boolean> {
    const task = await Task.findById(taskId);
    if (!task) {
        return false; // Task doesn't exist
    }

    if (task.userId.toString() === userId) {
        return true; // User is the owner
    }

    if (task.teamId) {
        const team = await Team.findOne({ _id: task.teamId, members: userId });
        if (team) {
            return true; // User is a member of the team assigned to the task
        }
    }

    return false;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.name) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id } = params;
        const hasPermission = await checkTaskPermission(id, session.user.id);

        if (!hasPermission) {
            return NextResponse.json({ message: 'Task not found or you do not have permission to edit it' }, { status: 404 });
        }
        
        const task = await Task.findById(id);
        if (!task) {
             return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        const originalAssignedTo = task.assignedTo?.toString();
        const body = await req.json();
        const { title, notes, priority, teamId, assignedTo, category, status, dueDate } = body;
        
        task.title = title ?? task.title;
        task.notes = notes ?? task.notes;
        task.priority = (priority === 'none' || priority === '') ? undefined : (priority ?? task.priority);
        task.teamId = (teamId === '__none__' || teamId === "") ? undefined : (teamId ?? task.teamId);
        task.assignedTo = (assignedTo === '__none__' || assignedTo === "") ? undefined : (assignedTo ?? task.assignedTo);
        task.status = status ?? task.status;
        if (dueDate !== undefined) {
          task.dueDate = dueDate ? new Date(dueDate) : undefined;
        }
        
        if (category !== undefined) {
          task.category = category;
        }
        
        await task.save();

        const newAssignedTo = task.assignedTo?.toString();
        // Notify user if they are newly assigned and a due date exists
        if (newAssignedTo && newAssignedTo !== originalAssignedTo && newAssignedTo !== session.user.id && task.dueDate) {
             const notification = new Notification({
                userId: task.assignedTo,
                type: 'TASK_ASSIGNED',
                message: `${session.user.name} assigned you the task: "${task.title}", due on ${format(task.dueDate, 'PPP')}`,
                data: { taskId: task._id },
            });
            await notification.save();
        }

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
            status: task.status,
            createdAt: task.createdAt.getTime(),
            dueDate: task.dueDate?.toISOString(),
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
        
        const hasPermission = await checkTaskPermission(id, session.user.id);
        
        if (!hasPermission) {
            return NextResponse.json({ message: 'Task not found or you do not have permission to delete it' }, { status: 404 });
        }

        await Task.deleteOne({ _id: id });

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
