import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;


export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret });
  
  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: 'Acesso não autorizado' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const books = await prisma.book.findMany({
      orderBy: {
        title: 'asc'
      }
    });
    return NextResponse.json(books);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Falha ao buscar os livros' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret });

  
  if (!token || (token.role !== 'ADMIN' && token.role !== 'BIBLIOTECARIO')) {
    return new NextResponse(
      JSON.stringify({ error: 'Acesso proibido' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const data = await request.json();

    if (!data?.title || !data?.author ) {
      return new NextResponse(JSON.stringify({ error: 'Título, autor' }), { status: 400 });
    }
    
    const existingBook = await prisma.book.findUnique({
        where: { isbn: data.isbn },
    });

    if (existingBook) {
        return new NextResponse(JSON.stringify({ error: 'Um livro com este ISBN já existe' }), { status: 409 });
    }

    const quantity = data.quantity ? parseInt(data.quantity, 10) : 1;
    if (isNaN(quantity) || quantity < 0) {
        return new NextResponse(JSON.stringify({ error: 'Quantidade inválida' }), { status: 400 });
    }

    
    const newBook = await prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        quantity: quantity,
        available: quantity,
      },
    });
    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Falha ao criar o livro' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
