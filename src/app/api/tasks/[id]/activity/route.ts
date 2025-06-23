
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Activity from '@/models/activity';
import Task from '@/models/task';
import Team from '@/models/team';
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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id: taskId } = params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return NextResponse.json({ message: 'Invalid Task ID' }, { status: 400 });
    }
    
    const hasPermission = await checkTaskPermission(taskId, session.user.id);
    if (!hasPermission) {
      return NextResponse.json({ message: 'You do not have permission to view this task\'s activity' }, { status: 403 });
    }

    const activities = await Activity.find({ taskId }).sort({ createdAt: -1 });

    const formattedActivities = activities.map(act => ({
      id: act._id.toString(),
      type: act.type,
      details: act.details,
      createdAt: act.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedActivities, { status: 200 });
  } catch (error) {
    console.error('Error fetching task activity:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
