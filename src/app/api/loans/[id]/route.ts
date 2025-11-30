import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  params: {
    id: string;
  };
};

// PUT /api/loans/[id] - Return a book (devolucao)
export async function PUT(request: NextRequest, { params }: Params) {
  // TODO: Add authentication and authorization (ADMIN or BIBLIOTECARIO)
  try {
    const loanId = params.id;
    const returnDate = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
      });

      if (!loan) {
        throw new Error('Loan not found');
      }
      
      if(loan.returnDate) {
        throw new Error('This loan has already been returned');
      }

      // Increment book availability
      await tx.book.update({
        where: { id: loan.bookId },
        data: { available: { increment: 1 } },
      });

      // Update loan status to RETURNED, will be overwritten if overdue
      let finalStatus: "RETURNED" | "OVERDUE" = "RETURNED";

      // Check for overdue and create a fine if necessary
      let fine = null;
      if (returnDate > loan.dueDate) {
        finalStatus = 'OVERDUE';
        const fineAmount = 5.00; // Example fine amount
        
        fine = await tx.fine.create({
          data: {
            amount: fineAmount,
            loanId: loanId,
            userId: loan.userId,
            paid: false,
          },
        });
      }
      
      // Update loan status and return date
      const updatedLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          returnDate: returnDate,
          status: finalStatus,
        },
      });
      
      return { updatedLoan, fine };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to return book';
    const statusCode = errorMessage === 'Loan not found' || errorMessage === 'This loan has already been returned' ? 400 : 500;
    
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
