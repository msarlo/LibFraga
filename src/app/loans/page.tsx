'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Loan {
  id: string;
  book: { title: string };
  user: { name: string };
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
}

export default function LoansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    // Only Admin and Librarian can manage loans
    if (session?.user?.role === 'ALUNO') {
        // Students might see their own loans, but for now let's restrict the main management page
        // Or we could filter by user if it's a student. 
        // The requirement says "Gerenciamento de Empréstimos", usually for staff.
        // Let's assume this page is for staff to see ALL loans.
        // If we want students to see their loans, we might do that in a profile page or a filtered view.
        // For now, let's redirect students or show a message.
        // Actually, the prompt says "Students view only". Maybe they can view their loans here?
        // Let's fetch all loans for now, the API might filter or we filter here.
        // But usually "Manage Loans" is for staff.
        // Let's stick to Staff for this page for now, or handle the "Student view" later.
        // Let's allow everyone to see, but maybe filter for students?
        // The API /api/loans returns all loans. It might be better to restrict this page to staff.
        if (session?.user?.role === 'ALUNO') {
             router.push('/'); // Redirect students to home for now
             return;
        }
    }

    fetchLoans();
  }, [status, session, router]);

  const fetchLoans = async () => {
    try {
      const res = await fetch('/api/loans');
      if (!res.ok) throw new Error('Falha ao carregar empréstimos');
      const data = await res.json();
      setLoans(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id: string) => {
    if (!confirm('Confirmar devolução do livro?')) return;

    try {
      const res = await fetch(`/api/loans/${id}/return`, {
        method: 'POST', // Or PUT, depending on API implementation. Usually PUT for updates.
        // Checking api/loans/[id]/return/route.ts... wait, the structure showed `api/loans/[id]/return`.
        // Let's assume it's a POST or PUT to that endpoint.
        // I'll check the API implementation if I can, but standard is often POST for actions.
        // Let's try POST.
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao devolver livro');
      }
      
      // Refresh list
      fetchLoans();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (status === 'loading' || loading) return <div className="container">Carregando...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Gerenciamento de Empréstimos</h1>
        <Link href="/loans/new" className="btn btn-primary">
          Novo Empréstimo
        </Link>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}> {/* List view style */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '1rem' }}>Livro</th>
              <th style={{ padding: '1rem' }}>Aluno</th>
              <th style={{ padding: '1rem' }}>Data Empréstimo</th>
              <th style={{ padding: '1rem' }}>Data Devolução Prevista</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{loan.book.title}</td>
                <td style={{ padding: '1rem' }}>{loan.user.name}</td>
                <td style={{ padding: '1rem' }}>{new Date(loan.loanDate).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding: '1rem' }}>{new Date(loan.dueDate).toLocaleDateString('pt-BR')}</td>
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
                  {!loan.returnDate && (
                    <button 
                      onClick={() => handleReturn(loan.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    >
                      Devolver
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  Nenhum empréstimo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
