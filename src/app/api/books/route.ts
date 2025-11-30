import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    // When creating a book, 'available' should default to the total 'quantity'
    const newBook = await prisma.book.create({
      data: {
        ...data,
        available: data.quantity,
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
