import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import BookActions from './BookActions';

export default async function BooksPage() {
  const books = await prisma.book.findMany({
    orderBy: {
      title: 'asc',
    },
  });

  return (
    <div>
      <div className="page-header">
        <h2>Gerenciamento de Livros</h2>
        <Link href="/books/form" className="btn btn-primary">
          Adicionar Livro
        </Link>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Quantidade</th>
              <th>Disponível</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {books.length > 0 ? (
              books.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.quantity}</td>
                  <td>{book.available}</td>
                  <td>
                    <BookActions bookId={book.id} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  Nenhum livro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
