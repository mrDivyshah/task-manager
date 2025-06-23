
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/task';
import Team from '@/models/team';
import User from '@/models/user';
<<<<<<< HEAD
=======
import Notification from '@/models/notification';
import Activity from '@/models/activity';
import { format } from 'date-fns';
import mongoose from 'mongoose';
>>>>>>> master

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();
<<<<<<< HEAD

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
=======
    const userObjectId = new mongoose.Types.ObjectId(session.user.id);

    // Find all teams the user is a member of
    const userTeams = await Team.find({ members: userObjectId }).select('_id');
    const userTeamIds = userTeams.map(team => team._id);

    // Find tasks created by the user, assigned to the user, OR in any of the user's teams
    const tasks = await Task.find({
      $or: [
        { userId: userObjectId },
        { teamIds: { $in: userTeamIds } },
        { assignedTo: userObjectId },
      ]
    })
      .populate({ path: 'userId', model: User, select: 'name email' })
      .populate({ path: 'teamIds', model: Team, select: 'name' })
>>>>>>> master
      .populate({ path: 'assignedTo', model: User, select: 'name email' })
      .sort({ createdAt: -1 });
    
    const formattedTasks = tasks.map(task => {
<<<<<<< HEAD
        const teamData = task.teamId as any; // Cast to access populated field
        const assignedToData = task.assignedTo as any;
=======
        const teamsData = task.teamIds as any[];
        const assignedToData = task.assignedTo as any[];
        const creatorData = task.userId as any;
>>>>>>> master
        return {
            id: task._id.toString(),
            title: task.title,
            notes: task.notes,
            status: task.status,
            category: task.category,
            priority: task.priority,
            createdAt: task.createdAt.getTime(),
<<<<<<< HEAD
            teamId: teamData?._id.toString(),
            team: teamData ? { name: teamData.name } : undefined,
            assignedTo: assignedToData ? { id: assignedToData._id.toString(), name: assignedToData.name, email: assignedToData.email } : undefined,
=======
            updatedAt: task.updatedAt.getTime(),
            dueDate: task.dueDate?.toISOString(),
            teamIds: teamsData?.map(t => t._id.toString()),
            teams: teamsData?.map(t => ({ id: t._id.toString(), name: t.name })),
            assignedTo: assignedToData?.map(a => ({ id: a._id.toString(), name: a.name, email: a.email })),
            createdBy: {
                id: creatorData._id.toString(),
                name: creatorData.name,
                email: creatorData.email,
            }
>>>>>>> master
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
<<<<<<< HEAD
    if (!session?.user?.id) {
=======
    if (!session?.user?.id || !session?.user?.name) {
>>>>>>> master
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
<<<<<<< HEAD
        const { title, notes, priority, teamId, assignedTo } = await req.json();
=======
        const { title, notes, priority, teamIds, assignedTo, dueDate } = await req.json();
>>>>>>> master

        if (!title) {
            return NextResponse.json({ message: 'Title is required' }, { status: 400 });
        }
        
        const newTaskData: any = {
            userId: session.user.id,
            title,
            notes,
            priority: priority && priority !== "none" ? priority : undefined,
<<<<<<< HEAD
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
        
        await task.populate([
            { path: 'teamId', model: Team, select: 'name' },
=======
            dueDate: dueDate ? new Date(dueDate) : undefined,
            teamIds: teamIds || [],
            assignedTo: assignedTo || [],
        };

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
        if (task.assignedTo && task.dueDate) {
            const assigneesToNotify = task.assignedTo.filter(id => id.toString() !== session.user.id);
            if (assigneesToNotify.length > 0) {
                 const notifications = assigneesToNotify.map(userId => ({
                    userId: userId,
                    type: 'TASK_ASSIGNED',
                    message: `${session.user.name} assigned you the task: "${task.title}", due on ${format(task.dueDate!, "PPP 'at' p")}`,
                    data: { taskId: task._id },
                }));
                await Notification.insertMany(notifications);
            }
        }
        
        await task.populate([
            { path: 'userId', model: User, select: 'name email' },
            { path: 'teamIds', model: Team, select: 'name' },
>>>>>>> master
            { path: 'assignedTo', model: User, select: 'name email' }
        ]);

        const taskObject = task.toObject();
<<<<<<< HEAD
        const teamData = taskObject.teamId as any;
        const assignedToData = taskObject.assignedTo as any;
=======
        const teamsData = taskObject.teamIds as any[];
        const assignedToData = taskObject.assignedTo as any[];
        const creatorData = taskObject.userId as any;
>>>>>>> master

        return NextResponse.json({
            ...taskObject,
            id: task._id.toString(),
            status: task.status,
            createdAt: task.createdAt.getTime(),
<<<<<<< HEAD
            team: teamData ? { name: teamData.name } : undefined,
            assignedTo: assignedToData ? { id: assignedToData._id.toString(), name: assignedToData.name, email: assignedToData.email } : undefined,
            teamId: teamData?._id.toString(),
=======
            updatedAt: task.updatedAt.getTime(),
            dueDate: task.dueDate?.toISOString(),
            teams: teamsData?.map(t => ({ id: t._id.toString(), name: t.name })),
            assignedTo: assignedToData?.map(a => ({ id: a._id.toString(), name: a.name, email: a.email })),
            teamIds: teamsData?.map(t => t._id.toString()),
            createdBy: {
                id: creatorData._id.toString(),
                name: creatorData.name,
                email: creatorData.email,
            }
>>>>>>> master
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
