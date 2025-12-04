import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { Prisma } from '@prisma/client';

const secret = process.env.NEXTAUTH_SECRET;

type Params = {
  params: {
    id: string; // Loan ID
  };
};

// POST /api/loans/[id]/return - Return a book
export async function POST(request: NextRequest, { params }: Params) {
  const token = await getToken({ req: request, secret });

  if (!token || (token.role !== 'ADMIN' && token.role !== 'BIBLIOTECARIO')) {
    return new NextResponse(JSON.stringify({ error: 'Acesso proibido' }), { status: 403 });
  }

  const loanId = params.id;

  try {
    const updatedLoan = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
      });

      if (!loan) {
        throw new Error('Empréstimo não encontrado');
      }

      if (loan.status === 'RETURNED') {
        throw new Error('Este livro já foi devolvido');
      }

      // Update book availability
      await tx.book.update({
        where: { id: loan.bookId },
        data: { available: { increment: 1 } },
      });

      const returnDate = new Date();
      const dueDate = new Date(loan.dueDate);
      let fineAmount = 0;

      // Check for overdue and create a fine if necessary
      if (returnDate > dueDate) {
        const daysOverdue = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        fineAmount = daysOverdue * 1.00; // R$ 1,00 per day

        await tx.fine.create({
          data: {
            loanId: loan.id,
            userId: loan.userId,
            amount: fineAmount,
            paid: false,
          },
        });
      }

      // Update loan status
      const finalLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          returnDate: returnDate,
          status: 'RETURNED',
        },
      });

      return { ...finalLoan, fineAmount };
    });

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Falha ao processar a devolução';
    const statusCode = (errorMessage.includes('Empréstimo não encontrado') || errorMessage.includes('já foi devolvido')) ? 400 : 500;
    
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode }
    );
  }
}
