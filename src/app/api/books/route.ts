import { prisma } from '@/lib/prisma';
import { isValidIsbn } from '@/lib/isbn';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/books - List all books
export async function GET(request: NextRequest) {
  // TODO: Add authentication (any logged-in user can view books)
  try {
    const books = await prisma.book.findMany();
    return NextResponse.json(books);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch books' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  // TODO: Add authentication and authorization (ADMIN or BIBLIOTECARIO)
  // TODO: Add input validation using a DTO
  try {
    const data = await request.json();

    // Validate required fields
    if (!data?.title || !data?.author) {
      return new NextResponse(JSON.stringify({ error: 'Título e autor são obrigatórios' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // If ISBN is provided and valid, use it. Otherwise generate an ISBN placeholder.
    let isbn = data?.isbn;
    if (isbn) {
      if (!isValidIsbn(isbn)) {
        // Provided ISBN is invalid — generate fallback using UUID instead of timestamp
        isbn = `ISBN-${randomUUID()}`;
      }
    } else {
      // No ISBN provided — generate fallback using UUID
      isbn = `ISBN-${randomUUID()}`;
    }

    // When creating a book, 'available' should default to the total 'quantity'
    const newBook = await prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        isbn,
        quantity: data.quantity ?? 1,
        available: data.quantity ?? 1,
      },
    });
    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create book' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
