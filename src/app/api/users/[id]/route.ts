import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
  params: {
    id: string;
  };
};

// GET /api/users/[id] - Get a single user
export async function GET(request: NextRequest, { params }: Params) {
  // TODO: Add authentication and authorization
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(request: NextRequest, { params }: Params) {
  // TODO: Add authentication and authorization
  // TODO: Add input validation
  try {
    const data = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: data,
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    // Prisma's P2025 is the error code for record not found on update/delete
    // @ts-ignore
    if (error.code === 'P2025') {
       return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(request: NextRequest, { params }: Params) {
  // TODO: Add authentication and authorization (only ADMIN)
  try {
    await prisma.user.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    // @ts-ignore
    if (error.code === 'P2025') {
       return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
