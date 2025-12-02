import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { Prisma } from '@prisma/client';

const secret = process.env.NEXTAUTH_SECRET;

// GET /api/loans - List all loans
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret });

  if (!token || (token.role !== 'ADMIN' && token.role !== 'BIBLIOTECARIO')) {
    return new NextResponse(JSON.stringify({ error: 'Acesso proibido' }), { status: 403 });
  }

  try {
    const loans = await prisma.loan.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        book: {
          select: { id: true, title: true }
        }
      },
      orderBy: {
        loanDate: 'desc'
      }
    });
    return NextResponse.json(loans);
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Falha ao buscar empréstimos' }), { status: 500 });
  }
}


// POST /api/loans - Create a new loan (emprestimo)
export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret });

  if (!token || (token.role !== 'ADMIN' && token.role !== 'BIBLIOTECARIO')) {
    return new NextResponse(JSON.stringify({ error: 'Acesso proibido' }), { status: 403 });
  }

  try {
    const { bookId, userId } = await request.json();

    if (!bookId || !userId) {
      return new NextResponse(
        JSON.stringify({ error: 'bookId e userId são obrigatórios' }),
        { status: 400 }
      );
    }

    const loanDurationInDays = 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDurationInDays);

    const newLoan = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const book = await tx.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new Error('Livro não encontrado');
      }

      if (book.available <= 0) {
        throw new Error('Não há cópias disponíveis deste livro');
      }

      // Check if user has overdue books
      const overdueLoans = await tx.loan.count({
        where: {
          userId: userId,
          status: 'ACTIVE',
          dueDate: {
            lt: new Date()
          }
        }
      });

      if (overdueLoans > 0) {
        throw new Error('O usuário possui livros em atraso e não pode realizar novos empréstimos.');
      }

      await tx.book.update({
        where: { id: bookId },
        data: { available: { decrement: 1 } },
      });

      const loan = await tx.loan.create({
        data: {
          bookId,
          userId,
          dueDate,
          status: 'ACTIVE',
        },
      });

      return loan;
    });

    return NextResponse.json(newLoan, { status: 201 });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Falha ao criar o empréstimo';
    const statusCode = (errorMessage.includes('Livro não encontrado') || errorMessage.includes('Não há cópias') || errorMessage.includes('livros em atraso')) ? 400 : 500;
    
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode }
    );
  }
}
