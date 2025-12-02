import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret });

  if (!token || token.role !== 'ADMIN') {
    return new NextResponse(
      JSON.stringify({ error: 'Acesso não autorizado' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const users = await prisma.user.findMany({
      // Omit password from the result
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Falha ao buscar usuários' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
