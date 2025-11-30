import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/loans - Create a new loan (emprestimo)
export async function POST(request: NextRequest) {
  // TODO: Add authentication and authorization (ADMIN or BIBLIOTECARIO)
  // TODO: Add input validation using a DTO
  try {
    const { bookId, userId } = await request.json();

    if (!bookId || !userId) {
      return new NextResponse(
        JSON.stringify({ error: 'bookId and userId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const loanDurationInDays = 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDurationInDays);

    const newLoan = await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new Error('Book not found');
      }

      if (book.available <= 0) {
        throw new Error('No available copies of this book');
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to create loan';
    // If the error is one of our specific transaction errors, use a 400 status code
    const statusCode = errorMessage === 'Book not found' || errorMessage === 'No available copies of this book' ? 400 : 500;
    
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
