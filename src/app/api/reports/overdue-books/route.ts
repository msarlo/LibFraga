import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// GET /api/reports/overdue-books - Report of all overdue books
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret });

  if (!token || (token.role !== 'ADMIN' && token.role !== 'BIBLIOTECARIO')) {
    return new NextResponse(JSON.stringify({ error: 'Acesso proibido' }), { status: 403 });
  }

  try {
    const now = new Date();

    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: 'ACTIVE', // Only consider loans that have not been returned
        dueDate: {
          lt: now, // 'lt' means less than
        },
      },
      include: {
        book: {
          select: { id: true, title: true, isbn: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return NextResponse.json(overdueLoans);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Falha ao gerar o relatório de livros em atraso' }),
      { status: 500 }
    );
  }
}
