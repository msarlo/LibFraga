import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret });

  if (!token || (token.role !== 'ADMIN' && token.role !== 'BIBLIOTECARIO')) {
    return new NextResponse(JSON.stringify({ error: 'Acesso não autorizado' }), { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  try {
    const students = await prisma.user.findMany({
      where: {
        role: 'ALUNO',
        name: {
          contains: search,
        },
      },
      include: {
        loans: {
          include: {
            book: {
              select: { title: true, isbn: true }
            }
          },
          orderBy: {
            loanDate: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching student loans:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Falha ao buscar histórico de alunos' }),
      { status: 500 }
    );
  }
}
