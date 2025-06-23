<<<<<<< HEAD
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Team from "@/models/team";
import mongoose from "mongoose";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
=======

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Team from '@/models/team';
import mongoose from 'mongoose';

export async function DELETE(req: Request, { params }: { params: { id: string; memberId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
>>>>>>> master
  }

  try {
    await dbConnect();
    const { id: teamId, memberId } = params;

<<<<<<< HEAD
    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      return NextResponse.json(
        { message: "Invalid team or member ID" },
        { status: 400 }
      );
=======
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(memberId)) {
        return NextResponse.json({ message: 'Invalid team or member ID' }, { status: 400 });
>>>>>>> master
    }

    const team = await Team.findById(teamId);

    if (!team) {
<<<<<<< HEAD
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
=======
      return NextResponse.json({ message: 'Team not found' }, { status: 404 });
>>>>>>> master
    }

    // Only the team owner can remove members
    if (team.ownerId.toString() !== session.user.id) {
<<<<<<< HEAD
      return NextResponse.json(
        { message: "You are not authorized to manage this team's members" },
        { status: 403 }
      );
    }

    // The owner cannot remove themselves
    if (memberId === team.ownerId.toString()) {
      return NextResponse.json(
        { message: "The team owner cannot be removed" },
        { status: 400 }
      );
=======
      return NextResponse.json({ message: "You are not authorized to manage this team's members" }, { status: 403 });
    }
    
    // The owner cannot remove themselves
    if (memberId === team.ownerId.toString()) {
        return NextResponse.json({ message: 'The team owner cannot be removed' }, { status: 400 });
>>>>>>> master
    }

    // Pull the member from the members array
    await Team.updateOne({ _id: teamId }, { $pull: { members: memberId } });

<<<<<<< HEAD
    return NextResponse.json(
      { message: "Member removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
=======
    // Here you might also want to unassign tasks from the removed member in this team
    // For now, we'll just remove them from the team.

    return NextResponse.json({ message: 'Member removed successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
>>>>>>> master
  }
}
