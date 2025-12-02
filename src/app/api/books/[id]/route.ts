import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

type Params = {
  params: {
    id: string;
  };
};

// GET /api/books/[id] - Get a single book
export async function GET(request: NextRequest, { params }: Params) {
  const token = await getToken({ req: request, secret });
  if (!token) {
    return new NextResponse(JSON.stringify({ error: 'Acesso não autorizado' }), { status: 401 });
  }

  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id },
    });
    if (!book) {
      return new NextResponse(JSON.stringify({ error: 'Livro não encontrado' }), { status: 404 });
    }
    return NextResponse.json(book);
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Falha ao buscar o livro' }), { status: 500 });
  }
}

// PUT /api/books/[id] - Update a book
export async function PUT(request: NextRequest, { params }: Params) {
  const token = await getToken({ req: request, secret });
  if (!token || (token.role !== 'ADMIN' && token.role !== 'BIBLIOTECARIO')) {
    return new NextResponse(JSON.stringify({ error: 'Acesso proibido' }), { status: 403 });
  }

  try {
    const data = await request.json();
    
    // Basic validation
    const quantity = data.quantity !== undefined ? parseInt(data.quantity, 10) : undefined;
    const available = data.available !== undefined ? parseInt(data.available, 10) : undefined;

    if ((quantity !== undefined && (isNaN(quantity) || quantity < 0)) || 
        (available !== undefined && (isNaN(available) || available < 0))) {
      return new NextResponse(JSON.stringify({ error: 'Quantidade e disponibilidade devem ser números não-negativos' }), { status: 400 });
    }
    
    if (available !== undefined && quantity !== undefined && available > quantity) {
        return new NextResponse(JSON.stringify({ error: 'A quantidade disponível não pode ser maior que a quantidade total' }), { status: 400 });
    }

    const updatedBook = await prisma.book.update({
      where: { id: params.id },
      data: data,
    });
    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error(error);
    // @ts-ignore
    if (error.code === 'P2025') {
       return new NextResponse(JSON.stringify({ error: 'Livro não encontrado' }), { status: 404 });
    }
    return new NextResponse(JSON.stringify({ error: 'Falha ao atualizar o livro' }), { status: 500 });
  }
}

// DELETE /api/books/[id] - Delete a book
export async function DELETE(request: NextRequest, { params }: Params) {
  const token = await getToken({ req: request, secret });
  if (!token || (token.role !== 'ADMIN' && token.role !== 'BIBLIOTECARIO')) {
    return new NextResponse(JSON.stringify({ error: 'Acesso proibido' }), { status: 403 });
  }

  try {
    // Check for active loans before deleting
    const activeLoans = await prisma.loan.count({
      where: {
        bookId: params.id,
        status: 'ACTIVE',
      },
    });

    if (activeLoans > 0) {
      return new NextResponse(
        JSON.stringify({ error: 'Não é possível deletar o livro, pois existem empréstimos ativos.' }),
        { status: 400 }
      );
    }

    await prisma.book.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    // @ts-ignore
    if (error.code === 'P2025') {
       return new NextResponse(JSON.stringify({ error: 'Livro não encontrado' }), { status: 404 });
    }
    return new NextResponse(JSON.stringify({ error: 'Falha ao deletar o livro' }), { status: 500 });
  }
}
