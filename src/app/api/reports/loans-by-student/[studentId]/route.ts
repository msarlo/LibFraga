import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

type Params = {
  params: {
    studentId: string;
  };
};

// GET /api/reports/loans-by-student/[studentId] - Report of loans for a student
export async function GET(request: NextRequest, { params }: Params) {
  const token = await getToken({ req: request, secret });
  const studentId = params.studentId;

  if (!token) {
    return new NextResponse(JSON.stringify({ error: 'Acesso não autorizado' }), { status: 401 });
  }

  // Authorization: ADMIN/BIBLIOTECARIO can see any student's report.
  // An ALUNO can only see their own report.
  if (token.role === 'ALUNO' && token.id !== studentId) {
    return new NextResponse(JSON.stringify({ error: 'Acesso proibido' }), { status: 403 });
  }

  try {
    const loans = await prisma.loan.findMany({
      where: {
        userId: studentId,
      },
      include: {
        book: {
          select: { id: true, title: true }
        },
        fine: true,
      },
      orderBy: {
        loanDate: 'desc',
      },
    });
    
    return NextResponse.json(loans);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Falha ao gerar o relatório de empréstimos do aluno' }),
      { status: 500 }
    );
  }
}
