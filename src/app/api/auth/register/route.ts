
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { message: 'Invalid input. Name, email, and a password of at least 6 characters are required.' },
        { status: 400 }
      );
    }
    
    await dbConnect();

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json(
      { message: 'User created successfully.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration Error:', error);

    // Check for MongoDB duplicate key error (code 11000)
    if (error.code === 11000 && error.keyPattern?.email) {
      return NextResponse.json(
        { message: 'An account with this email already exists.' },
        { status: 409 } // 409 Conflict is the appropriate status code
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json(
      { message: 'An internal server error occurred during registration.', error: errorMessage },
      { status: 500 }
    );
  }
}
