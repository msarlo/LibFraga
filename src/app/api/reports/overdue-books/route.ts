import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/reports/overdue-books - Report of all overdue books
export async function GET(request: NextRequest) {
  // TODO: Add authentication and authorization (ADMIN or BIBLIOTECARIO)
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
        book: true,
        user: true, // Include user details to know who has the book
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return NextResponse.json(overdueLoans);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch overdue books report' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
