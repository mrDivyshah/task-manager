
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/task';
import Team from '@/models/team';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();
    const tasks = await Task.find({ userId: session.user.id })
      .populate({ path: 'teamId', model: Team, select: 'name' })
      .sort({ createdAt: -1 });
    
    const formattedTasks = tasks.map(task => {
        const teamData = task.teamId as any; // Cast to access populated field
        return {
            id: task._id.toString(),
            title: task.title,
            notes: task.notes,
            category: task.category,
            priority: task.priority,
            createdAt: task.createdAt.getTime(),
            teamId: teamData?._id.toString(),
            team: teamData ? { name: teamData.name } : undefined,
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
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { title, notes, priority, teamId } = await req.json();

        if (!title) {
            return NextResponse.json({ message: 'Title is required' }, { status: 400 });
        }
        
        const newTaskData: any = {
            userId: session.user.id,
            title,
            notes,
            priority: priority && priority !== "none" ? priority : undefined,
        };

        if (teamId && teamId !== '__none__') {
            newTaskData.teamId = teamId;
        }

        const task = new Task(newTaskData);
        await task.save();
        
        const taskObject = task.toObject();

        return NextResponse.json({
            ...taskObject,
            id: task._id.toString(),
            createdAt: task.createdAt.getTime(),
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
