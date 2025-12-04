import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';

const secret = process.env.NEXTAUTH_SECRET;

type Params = {
  params: {
    id: string;
  };
};

// GET /api/users/[id] - Get a single user
export async function GET(request: NextRequest, { params }: Params) {
  const token = await getToken({ req: request, secret });
  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: 'Acesso não autorizado' }),
      { status: 401 }
    );
  }

  // An ALUNO can only see their own profile. ADMIN/BIBLIOTECARIO can see any.
  if (token.role === 'ALUNO' && token.id !== params.id) {
    return new NextResponse(
      JSON.stringify({ error: 'Acesso proibido' }),
      { status: 403 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404 }
      );
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Falha ao buscar usuário' }),
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(request: NextRequest, { params }: Params) {
  const token = await getToken({ req: request, secret });
  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: 'Acesso não autorizado' }),
      { status: 401 }
    );
  }

  // An ALUNO can only update their own profile. ADMIN/BIBLIOTECARIO can update any.
  if (token.role === 'ALUNO' && token.id !== params.id) {
    return new NextResponse(
      JSON.stringify({ error: 'Acesso proibido' }),
      { status: 403 }
    );
  }

  try {
    const data = await request.json();

    // Prevent non-admins from changing user roles
    if (token.role !== 'ADMIN' && data.role) {
      delete data.role;
    }

    // Prevent password changes through this endpoint for now
    // A dedicated "change password" endpoint would be better
    if (data.password) {
      delete data.password;
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    // @ts-ignore
    if (error.code === 'P2025') {
      return new NextResponse(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404 }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: 'Falha ao atualizar usuário' }),
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(request: NextRequest, { params }: Params) {
  const token = await getToken({ req: request, secret });

  // Only ADMINs can delete users
  if (!token || token.role !== 'ADMIN') {
    return new NextResponse(
      JSON.stringify({ error: 'Acesso proibido' }),
      { status: 403 }
    );
  }

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
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404 }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: 'Falha ao deletar usuário' }),
      { status: 500 }
    );
  }
}
