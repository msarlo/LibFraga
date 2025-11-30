import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  params: {
    studentId: string;
  };
};

// GET /api/reports/loans-by-student/[studentId] - Report of loans for a student
export async function GET(request: NextRequest, { params }: Params) {
  // TODO: Add authentication and authorization (ADMIN, BIBLIOTECARIO, or the student themselves)
  try {
    const studentId = params.studentId;

    const loans = await prisma.loan.findMany({
      where: {
        userId: studentId,
      },
      include: {
        book: true, // Include the details of the borrowed book
        fine: true, // Include any associated fine
      },
      orderBy: {
        loanDate: 'desc',
      },
    });
    
    return NextResponse.json(loans);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch student loans report' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
