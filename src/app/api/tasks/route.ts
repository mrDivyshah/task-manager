
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/task';
import Team from '@/models/team';
import User from '@/models/user';
import Notification from '@/models/notification';
import Activity from '@/models/activity';
import { format } from 'date-fns';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();

    // Find all teams the user is a member of
    const userTeams = await Team.find({ members: session.user.id }).select('_id');
    const userTeamIds = userTeams.map(team => team._id);

    // Find tasks created by the user OR assigned to any of the user's teams
    const tasks = await Task.find({
      $or: [
        { userId: session.user.id }, // Personal tasks created by the user
        { teamId: { $in: userTeamIds } } // Tasks in teams the user is a member of
      ]
    })
      .populate({ path: 'teamId', model: Team, select: 'name' })
      .populate({ path: 'assignedTo', model: User, select: 'name email' })
      .sort({ createdAt: -1 });
    
    const formattedTasks = tasks.map(task => {
        const teamData = task.teamId as any; // Cast to access populated field
        const assignedToData = task.assignedTo as any;
        return {
            id: task._id.toString(),
            title: task.title,
            notes: task.notes,
            status: task.status,
            category: task.category,
            priority: task.priority,
            createdAt: task.createdAt.getTime(),
            dueDate: task.dueDate?.toISOString(),
            teamId: teamData?._id.toString(),
            team: teamData ? { name: teamData.name } : undefined,
            assignedTo: assignedToData ? { id: assignedToData._id.toString(), name: assignedToData.name, email: assignedToData.email } : undefined,
        };
    });

    return NextResponse.json(formattedTasks, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.name) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { title, notes, priority, teamId, assignedTo, dueDate } = await req.json();

        if (!title) {
            return NextResponse.json({ message: 'Title is required' }, { status: 400 });
        }
        
        const newTaskData: any = {
            userId: session.user.id,
            title,
            notes,
            priority: priority && priority !== "none" ? priority : undefined,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            // status will be set by default in the schema
        };

        if (teamId && teamId !== '__none__') {
            newTaskData.teamId = teamId;
        }

        if (assignedTo && assignedTo !== '__none__') {
            newTaskData.assignedTo = assignedTo;
        }

        const task = new Task(newTaskData);
        await task.save();
        
        // Log activity for task creation
        const activity = new Activity({
            taskId: task._id,
            userId: session.user.id,
            type: 'CREATE',
            details: {
                userName: session.user.name,
                to: task.title,
            }
        });
        await activity.save();


        // Create notification if assigned to someone else with a due date
        if (task.assignedTo && task.dueDate && task.assignedTo.toString() !== session.user.id) {
            const notification = new Notification({
                userId: task.assignedTo,
                type: 'TASK_ASSIGNED',
                message: `${session.user.name} assigned you a task: "${task.title}", due on ${format(task.dueDate, "PPP 'at' p")}`,
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
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
