import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  // TODO: Add authentication and authorization (only ADMIN)
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch users' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  // TODO: Add authentication and authorization (only ADMIN)
  // TODO: Add input validation using a DTO
  try {
    const data = await request.json();
    const newUser = await prisma.user.create({
      data: data,
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
