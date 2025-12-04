'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Fine {
  id: string;
  amount: number;
  paid: boolean;
  paidAt: string | null;
}

interface Loan {
  id: string;
  book: { title: string };
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
  fine: Fine | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Check permissions: Admin/Librarian or the user themselves
    if (session?.user?.role === 'ALUNO' && session?.user?.id !== params.id) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, loansRes] = await Promise.all([
          fetch(`/api/users/${params.id}`),
          fetch(`/api/reports/loans-by-student/${params.id}`)
        ]);

        if (!userRes.ok) throw new Error('Falha ao carregar usuário');
        if (!loansRes.ok) throw new Error('Falha ao carregar histórico');

        const userData = await userRes.json();
        const loansData = await loansRes.json();

        setUser(userData);
        setLoans(loansData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session, router, params.id]);

  const handlePayFine = async (fineId: string) => {
    if (!confirm('Confirmar pagamento da multa?')) return;

    try {
      const res = await fetch(`/api/fines/${fineId}`, {
        method: 'PUT',
      });

      if (!res.ok) {
        throw new Error('Falha ao registrar pagamento');
      }

      // Refresh data
      const loansRes = await fetch(`/api/reports/loans-by-student/${params.id}`);
      const loansData = await loansRes.json();
      setLoans(loansData);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (status === 'loading' || loading) return <div className="container">Carregando...</div>;
  if (!user) return <div className="container">Usuário não encontrado</div>;

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h1>Perfil do Usuário</h1>
        <p><strong>Nome:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Função:</strong> {user.role}</p>
      </div>

      <h2>Histórico de Empréstimos</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '1rem' }}>Livro</th>
              <th style={{ padding: '1rem' }}>Data Empréstimo</th>
              <th style={{ padding: '1rem' }}>Data Devolução</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Multa</th>
              <th style={{ padding: '1rem' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{loan.book.title}</td>
                <td style={{ padding: '1rem' }}>{new Date(loan.loanDate).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding: '1rem' }}>
                  {loan.returnDate 
                    ? new Date(loan.returnDate).toLocaleDateString('pt-BR') 
                    : new Date(loan.dueDate).toLocaleDateString('pt-BR') + ' (Prevista)'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: loan.returnDate ? '#d4edda' : (new Date(loan.dueDate) < new Date() ? '#f8d7da' : '#fff3cd'),
                    color: loan.returnDate ? '#155724' : (new Date(loan.dueDate) < new Date() ? '#721c24' : '#856404'),
                    fontSize: '0.875rem'
                  }}>
                    {loan.returnDate ? 'Devolvido' : (new Date(loan.dueDate) < new Date() ? 'Atrasado' : 'Em andamento')}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {loan.fine ? (
                    <span style={{ color: loan.fine.paid ? 'green' : 'red' }}>
                      R$ {loan.fine.amount.toFixed(2)} ({loan.fine.paid ? 'Paga' : 'Pendente'})
                    </span>
                  ) : '-'}
                </td>
                <td style={{ padding: '1rem' }}>
                  {loan.fine && !loan.fine.paid && (session?.user?.role === 'ADMIN' || session?.user?.role === 'BIBLIOTECARIO') && (
                    <button 
                      onClick={() => handlePayFine(loan.fine!.id)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    >
                      Pagar Multa
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  Nenhum histórico encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
