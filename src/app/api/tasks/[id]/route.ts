
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Task, { type ITask } from '@/models/task';
import User from '@/models/user';
import Team from '@/models/team';
import Notification from '@/models/notification';
import Activity from '@/models/activity';
import { format } from 'date-fns';
import mongoose from 'mongoose';

async function checkTaskPermission(taskId: string, userId: string): Promise<boolean> {
    const task = await Task.findById(taskId).lean();
    if (!task) return false;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (task.userId.equals(userObjectId)) return true;
    
    if (task.assignedTo?.some((id: mongoose.Types.ObjectId) => id.equals(userObjectId))) return true;

    if (task.teamIds && task.teamIds.length > 0) {
        const teamCount = await Team.countDocuments({ _id: { $in: task.teamIds }, members: userObjectId });
        if (teamCount > 0) return true;
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
        
        const task = await Task.findById(id).populate('assignedTo', 'name');
        if (!task) {
             return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        const originalTask = task.toObject() as ITask & { assignedTo?: { _id: mongoose.Types.ObjectId, name: string }[] };
        const body = await req.json();
        const { title, notes, priority, teamIds, assignedTo, category, status, dueDate } = body;
        
        task.title = title ?? task.title;
        task.notes = notes ?? task.notes;
        task.priority = (priority === 'none' || priority === '') ? undefined : (priority ?? task.priority);
        task.teamIds = teamIds ?? task.teamIds;
        task.assignedTo = assignedTo ?? task.assignedTo;
        task.status = status ?? task.status;
        if (dueDate !== undefined) {
          task.dueDate = dueDate ? new Date(dueDate) : undefined;
        }
        
        if (category !== undefined) {
          task.category = category;
        }
        
        await task.save();
        
        // --- Activity Logging ---
        const createActivity = async (type: string, details: any) => {
            const activity = new Activity({
                taskId: task._id,
                userId: session.user!.id,
                type,
                details: { ...details, userName: session.user!.name },
            });
            await activity.save();
        };
        
        if (originalTask.title !== task.title) {
            await createActivity('UPDATE', { field: 'Title', from: originalTask.title, to: task.title });
        }
        if (originalTask.notes !== task.notes) {
            await createActivity('UPDATE', { field: 'Notes' });
        }
        const originalPriority = originalTask.priority || 'none';
        const newPriority = task.priority || 'none';
        if (originalPriority !== newPriority) {
            await createActivity('UPDATE', { field: 'Priority', from: originalPriority, to: newPriority });
        }
        const originalDueDate = originalTask.dueDate ? new Date(originalTask.dueDate) : null;
        const newDueDate = task.dueDate ? new Date(task.dueDate) : null;
        if (originalDueDate?.getTime() !== newDueDate?.getTime()) {
            const formatd = (d: Date | null) => d ? format(d, "MMM d, yyyy 'at' p") : 'none';
            await createActivity('UPDATE', { field: 'Due Date', from: formatd(originalDueDate), to: formatd(newDueDate) });
        }

        if (originalTask.status !== task.status) {
            await createActivity('STATUS_CHANGE', { from: originalTask.status, to: task.status });
        }

        const originalAssignedIds = (originalTask.assignedTo || []).map(u => u._id.toString()).sort();
        const newAssignedIds = (task.assignedTo || []).map(id => id.toString()).sort();

        if (JSON.stringify(originalAssignedIds) !== JSON.stringify(newAssignedIds)) {
             const oldUsers = await User.find({ _id: { $in: originalAssignedIds } }).select('name');
             const newUsers = await User.find({ _id: { $in: newAssignedIds } }).select('name');
             const oldNames = oldUsers.map(u => u.name).join(', ') || 'Unassigned';
             const newNames = newUsers.map(u => u.name).join(', ') || 'Unassigned';
             await createActivity('ASSIGNMENT_CHANGE', { from: oldNames, to: newNames });
        }
        // --- End Activity Logging ---

        // --- Notifications ---
        const newlyAssignedUserIds = newAssignedIds.filter(id => !originalAssignedIds.includes(id) && id !== session.user.id);
        if (newlyAssignedUserIds.length > 0 && task.dueDate) {
             const notifications = newlyAssignedUserIds.map(userId => ({
                userId: userId,
                type: 'TASK_ASSIGNED' as const,
                message: `${session.user.name} assigned you the task: "${task.title}", due on ${format(task.dueDate!, "PPP 'at' p")}`,
                data: { taskId: task._id },
            }));
            await Notification.insertMany(notifications);
        }
        // --- End Notifications ---

        await task.populate([
            { path: 'teamIds', model: Team, select: 'name' },
            { path: 'assignedTo', model: User, select: 'name email' }
        ]);
        const taskObject = task.toObject();
        
        const teamsData = taskObject.teamIds as any[];
        const assignedToData = taskObject.assignedTo as any[];

        return NextResponse.json({
            ...taskObject,
            id: task._id.toString(),
            status: task.status,
            createdAt: task.createdAt.getTime(),
            dueDate: task.dueDate?.toISOString(),
            teams: teamsData?.map(t => ({ id: t._id.toString(), name: t.name })),
            assignedTo: assignedToData?.map(a => ({ id: a._id.toString(), name: a.name, email: a.email })),
            teamIds: teamsData?.map(t => t._id.toString()),
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
        await Activity.deleteMany({ taskId: id });


        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
