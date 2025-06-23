
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/task';
import Team from '@/models/team';
import Activity from '@/models/activity';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();
    const userObjectId = new mongoose.Types.ObjectId(session.user.id);

    // Find all teams the user is a member of
    const userTeams = await Team.find({ members: userObjectId }).select('_id');
    const userTeamIds = userTeams.map(team => team._id);

    // Find tasks created by the user, assigned to the user, OR in any of the user's teams
    const userTasks = await Task.find({
      $or: [
        { userId: userObjectId },
        { teamIds: { $in: userTeamIds } },
        { assignedTo: userObjectId },
      ]
    }).select('_id');
    const userTaskIds = userTasks.map(task => task._id);

    // Find all activities for those tasks
    const activities = await Activity.find({ taskId: { $in: userTaskIds } })
      .populate({ path: 'taskId', model: Task, select: 'title' })
      .sort({ createdAt: -1 });

    const formattedActivities = activities.map(act => {
        const taskData = act.taskId as any;
        return {
            id: act._id.toString(),
            taskId: taskData?._id.toString(),
            taskTitle: taskData?.title,
            type: act.type,
            details: act.details,
            createdAt: act.createdAt.toISOString(),
        };
    });

    return NextResponse.json(formattedActivities, { status: 200 });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
