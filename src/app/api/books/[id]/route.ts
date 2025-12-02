import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';


type Params = {
  params: {
    id: string;
  };
};

// GET /api/books/[id] - Get a single book
export async function GET(request: NextRequest, { params }: Params) {
  // TODO: Add authentication
  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id },
    });
    if (!book) {
      return new NextResponse(
        JSON.stringify({ error: 'Book not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return NextResponse.json(book);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch book' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PUT /api/books/[id] - Update a book
export async function PUT(request: NextRequest, { params }: Params) {
  // TODO: Add authentication and authorization (ADMIN or BIBLIOTECARIO)
  // TODO: Add input validation
  try {
    const data = await request.json();
    const updatedBook = await prisma.book.update({
      where: { id: params.id },
      data: data,
    });
    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error(error);
    // @ts-ignore
    if (error.code === 'P2025') {
       return new NextResponse(
        JSON.stringify({ error: 'Book not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update book' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE /api/books/[id] - Delete a book
export async function DELETE(request: NextRequest, { params }: Params) {
  // TODO: Add authentication and authorization (ADMIN or BIBLIOTECARIO)
  try {
    await prisma.book.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    // @ts-ignore
    if (error.code === 'P2025') {
       return new NextResponse(
        JSON.stringify({ error: 'Book not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete book' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
