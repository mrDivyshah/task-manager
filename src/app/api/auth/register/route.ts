
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';

export async function POST(req: Request) {
  try {
    // --- TEMPORARY DEBUGGING CODE ---
    // The following code bypasses the database to test the API route itself.
    // If sign-up succeeds with this code, the issue is with the database connection.
    // Check your server logs for the "DEBUG" message.
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
        return NextResponse.json({ message: "DEBUG: Form data received, but validation failed on server." }, { status: 400 });
    }
    console.log("DEBUG: Registration API reached. Bypassing database logic for testing.");
    return NextResponse.json(
        { message: 'DEBUG: Registration endpoint reached successfully. Database logic was skipped.' },
        { status: 201 }
    );
    // --- END TEMPORARY DEBUGGING CODE ---

    /* --- ORIGINAL CODE (COMMENTED OUT FOR DEBUGGING) ---
    const { name, email, password } = await req.json();

    if (!name || !email || !password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { message: 'Invalid input. Name, email, and a password of at least 6 characters are required.' },
        { status: 400 }
      );
    }
    
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

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
    */
  } catch (error) {
    console.error('Registration Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json(
      { message: 'An internal server error occurred during registration.', error: errorMessage },
      { status: 500 }
    );
  }
}
