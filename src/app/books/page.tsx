'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import BookActions from './BookActions';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';

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
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredBooks = useMemo(() => {
    if (!searchTerm.trim()) return books;

    const term = searchTerm.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term)
    );
  }, [books, searchTerm]);

  const hasActiveFilters = !!searchTerm;

  if (loading) {
    return <LoadingState message="Carregando livros..." />;
  }

  return (
    <div>
      <PageHeader
        title="Gerenciamento de Livros"
        actionLabel="Adicionar Livro"
        actionHref="/books/form"
        showAction={canManage}
      />

      <div className="filter-card">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Pesquisar por título ou autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
            style={{ maxWidth: '400px' }}
          />
          {searchTerm && (
            <>
              <span className="filter-count">
                {filteredBooks.length} de {books.length} livros
              </span>
              <button
                onClick={() => setSearchTerm('')}
                className="btn btn-secondary btn-sm"
              >
                Limpar filtro
              </button>
            </>
          )}
        </div>
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
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <tr
                  key={book.id}
                  className={book.available === 0 ? 'book-unavailable' : ''}
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
                <td colSpan={canManage ? 6 : 5}>
                  <EmptyState
                    icon="📚"
                    message="Nenhum livro cadastrado."
                    filteredMessage={`Nenhum livro encontrado para "${searchTerm}"`}
                    hasFilters={hasActiveFilters}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
