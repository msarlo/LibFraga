import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export const runtime = 'nodejs';

type Params = {
  params: {
    id: string;
  };
};

// PUT /api/fines/[id] - Mark a fine as paid
export async function PUT(request: NextRequest, { params }: Params) {
  const token = await getToken({ req: request, secret });

  if (!token || (token.role !== 'ADMIN' && token.role !== 'BIBLIOTECARIO')) {
    return new NextResponse(JSON.stringify({ error: 'Acesso proibido' }), { status: 403 });
  }

  try {
    const fineId = params.id;

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
       return new NextResponse(
        JSON.stringify({ error: 'Fine not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update fine' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
