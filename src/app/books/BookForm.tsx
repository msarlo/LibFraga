"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Book } from '../../generated/prisma/client';
import { isValidIsbn } from '@/lib/isbn';

type BookFormProps = {
  book?: Book;
};

export default function BookForm({ book }: BookFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    quantity: 1,
    isbn: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(book);

  useEffect(() => {
    if (isEditMode && book) {
      setFormData({
        title: book.title,
        author: book.author,
        quantity: book.quantity,
        isbn: (book as any).isbn ?? '',
      });
    }
  }, [isEditMode, book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    // Validate ISBN only if provided; backend will generate one otherwise
    if (formData.isbn && !isValidIsbn(formData.isbn)) {
      setError('ISBN inválido. Use ISBN-10 ou ISBN-13 válidos, ou deixe em branco para gerar automaticamente.');
      setIsLoading(false);
      return;
    }
    const apiEndpoint = isEditMode ? `/api/books/${book?.id}` : '/api/books';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(apiEndpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Algo deu errado');
      }

      // Redirect to the books list on success
      router.push('/books');
      router.refresh(); // Ensure the list is updated
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="author">Autor</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="isbn">ISBN</label>
          <input
            type="text"
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            placeholder="Opcional — será gerado automaticamente se vazio"
          />
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Quantidade</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push('/books')}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Livro'}
          </button>
        </div>
      </form>
    </div>
  );
}
