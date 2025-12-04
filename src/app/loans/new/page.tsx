'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  role: string;
}

interface Book {
  id: string;
  title: string;
  available: number;
}

export default function NewLoanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [formData, setFormData] = useState({
    userId: '',
    bookId: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user?.role === 'ALUNO') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, booksRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/books')
        ]);

        if (!usersRes.ok || !booksRes.ok) throw new Error('Falha ao carregar dados');

        const usersData = await usersRes.json();
        const booksData = await booksRes.json();

        // Filter only students (ALUNO) and available books
        setUsers(usersData.filter((u: User) => u.role === 'ALUNO'));
        setBooks(booksData.filter((b: Book) => b.available > 0));
        
        // Set default due date to 7 days from now
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        setFormData(prev => ({ ...prev, dueDate: nextWeek.toISOString().split('T')[0] }));

      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.userId || !formData.bookId || !formData.dueDate) {
      setError('Preencha todos os campos');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId,
          bookId: formData.bookId,
          dueDate: new Date(formData.dueDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao criar empréstimo');
      }

      router.push('/loans');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || fetchingData) return <div className="container">Carregando...</div>;

  return (
    <div className="form-container">
      <h2>Novo Empréstimo</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userId">Aluno</label>
          <select
            id="userId"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
            style={{
                width: '100%',
                padding: '0.8rem',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '1rem',
                backgroundColor: 'white'
            }}
          >
            <option value="">Selecione um aluno</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bookId">Livro</label>
          <select
            id="bookId"
            name="bookId"
            value={formData.bookId}
            onChange={handleChange}
            required
            style={{
                width: '100%',
                padding: '0.8rem',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '1rem',
                backgroundColor: 'white'
            }}
          >
            <option value="">Selecione um livro</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Data de Devolução</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push('/loans')}
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Empréstimo'}
          </button>
        </div>
      </form>
    </div>
  );
}
