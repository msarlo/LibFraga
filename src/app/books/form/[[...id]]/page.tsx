'use client';

import { useState, useEffect } from 'react';
import BookForm from '../../BookForm';

type BookFormPageProps = {
  params: {
    id?: string[];
  };
};

export default function BookFormPage({ params }: BookFormPageProps) {
  const bookId = params.id?.[0];
  const isEditMode = Boolean(bookId);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      fetch(`/api/books/${bookId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch book');
        })
        .then((data) => {
          setBook(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isEditMode, bookId]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (isEditMode && !book) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2>Livro não encontrado</h2>
        <p>O livro que você está tentando editar não existe.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>{isEditMode ? 'Editar Livro' : 'Adicionar Novo Livro'}</h2>
      <BookForm book={book ?? undefined} />
    </div>
  );
}

