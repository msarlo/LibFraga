'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import BookActions from './BookActions';

type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  available: number;
};

export default function BooksPage() {
  const { data: session } = useSession();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.role === 'ADMIN';
  const isLibrarian = session?.user?.role === 'BIBLIOTECARIO';
  const canManage = isAdmin || isLibrarian;

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      } else {
        console.error('Failed to fetch books');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando livros...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Gerenciamento de Livros</h2>
        {canManage && (
          <Link href="/books/form" className="btn btn-primary">
            Adicionar Livro
          </Link>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>
                ISBN
                <div className="tooltip">
                  <span className="tooltip-icon">i</span>
                  <span className="tooltip-text">
                    International Standard Book Number - Código único que identifica livros e edições.
                  </span>
                </div>
              </th>
              <th>Quantidade</th>
              <th>Disponível</th>
              {canManage && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {books.length > 0 ? (
              books.map((book) => (
                <tr 
                  key={book.id} 
                  className={book.available === 0 ? 'book-unavailable' : ''}
                  style={book.available === 0 ? { opacity: 0.5, backgroundColor: '#f9f9f9' } : {}}
                >
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.quantity}</td>
                  <td>{book.available}</td>
                  {canManage && (
                    <td>
                      <BookActions bookId={book.id} onDeleted={fetchBooks} />
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={canManage ? 6 : 5} style={{ textAlign: 'center' }}>
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

