import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// GET /api/reports/popular-books - Report of most borrowed books
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret });

  if (!token || (token.role !== 'ADMIN' && token.role !== 'BIBLIOTECARIO')) {
    return new NextResponse(JSON.stringify({ error: 'Acesso proibido' }), { status: 403 });
  }

  try {
    // Group by bookId and count
    const popularBooks = await prisma.loan.groupBy({
      by: ['bookId'],
      _count: {
        bookId: true,
      },
      orderBy: {
        _count: {
          bookId: 'desc',
        },
      },
      take: 10, // Top 10
    });

    // Fetch book details for these IDs
    // Prisma groupBy doesn't support include, so we need a second query or raw query.
    // Let's use a second query to get book details.
    
    const bookIds = popularBooks.map((item: { bookId: string }) => item.bookId);
    
    const books = await prisma.book.findMany({
      where: {
        id: { in: bookIds }
      },
      select: {
        id: true,
        title: true,
        author: true
      }
    });

    // Merge data
    const result = popularBooks.map((item: { bookId: string, _count: { bookId: number } }) => {
      const book = books.find((b: { id: string }) => b.id === item.bookId);
      return {
        bookId: item.bookId,
        count: item._count.bookId,
        title: book?.title || 'Desconhecido',
        author: book?.author || 'Desconhecido'
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Falha ao gerar o relatório de livros populares' }),
      { status: 500 }
    );
  }
}
