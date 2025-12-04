"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { isValidIsbn } from '@/lib/isbn';

type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  available: number;
};

type BookFormProps = {
  book?: Book;
};

export default function BookForm({ book }: BookFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  
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
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const role = session?.user?.role;
      if (role !== 'ADMIN' && role !== 'BIBLIOTECARIO') {
        router.push('/books'); // Redirect unauthorized users
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (isEditMode && book) {
      setFormData({
        title: book.title,
        author: book.author,
        quantity: book.quantity,
        isbn: book.isbn ?? '',
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

      router.push('/books');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') return <p>Carregando...</p>;

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

