import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

type Params = {
  params: {
    id: string; // Fine ID
  };
};

// POST /api/fines/[id]/pay - Mark a fine as paid
export async function POST(request: NextRequest, { params }: Params) {
  const token = await getToken({ req: request, secret });

  if (!token || (token.role !== 'ADMIN' && token.role !== 'BIBLIOTECARIO')) {
    return new NextResponse(JSON.stringify({ error: 'Acesso proibido' }), { status: 403 });
  }

  try {
    const fineId = params.id;

    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
    });

    if (!fine) {
      return new NextResponse(JSON.stringify({ error: 'Multa não encontrada' }), { status: 404 });
    }

    if (fine.paid) {
      return new NextResponse(JSON.stringify({ error: 'Esta multa já foi paga' }), { status: 400 });
    }

    const updatedFine = await prisma.fine.update({
      where: { id: fineId },
      data: {
        paid: true,
        paidAt: new Date(),
      },
    });

    return NextResponse.json(updatedFine);
  } catch (error) {
    console.error(error);
    // @ts-ignore
    if (error.code === 'P2025') {
       return new NextResponse(JSON.stringify({ error: 'Multa não encontrada' }), { status: 404 });
    }
    return new NextResponse(JSON.stringify({ error: 'Falha ao atualizar a multa' }), { status: 500 });
  }
}
