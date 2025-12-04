'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface OverdueLoan {
  id: string;
  book: { title: string; isbn: string };
  user: { name: string; email: string };
  dueDate: string;
}

interface StudentHistory {
  id: string;
  name: string;
  email: string;
  loans: {
    id: string;
    book: { title: string; isbn: string };
    loanDate: string;
    dueDate: string;
    returnDate: string | null;
    status: string;
  }[];
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'RETURNED':
      return <span className="badge badge-success">Devolvido</span>;
    case 'OVERDUE':
      return <span className="badge badge-danger">Atrasado</span>;
    default:
      return <span className="badge badge-info">Ativo</span>;
  }
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [overdueLoans, setOverdueLoans] = useState<OverdueLoan[]>([]);
  const [studentHistory, setStudentHistory] = useState<StudentHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
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

    fetchData();
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ALUNO') {
      fetchStudentHistory();
    }
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      const overdueRes = await fetch('/api/reports/overdue-books');
      if (!overdueRes.ok) throw new Error('Falha ao carregar pendências');
      const overdueData = await overdueRes.json();
      setOverdueLoans(overdueData);

      await fetchStudentHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentHistory = async () => {
    try {
      const res = await fetch(`/api/reports/loans-by-student?search=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const data = await res.json();
        setStudentHistory(data);
      }
    } catch (error) {
      console.error("Error fetching student history", error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Carregando relatórios...</span>
      </div>
    );
  }

  return (
    <div>
      <h1>Relatórios</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="flex flex-col gap-3 mt-3">

        {/* Overdue Books Section */}
        <div className="card">
          <h2 className="mb-2">Livros em Atraso (Pendências)</h2>
          {overdueLoans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✓</div>
              <p>Nenhuma pendência encontrada.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Livro</th>
                    <th>Vencimento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <strong>{loan.user.name}</strong>
                        <br />
                        <span className="text-muted">{loan.user.email}</span>
                      </td>
                      <td>{loan.book.title}</td>
                      <td>{new Date(loan.dueDate).toLocaleDateString('pt-BR')}</td>
                      <td><span className="badge badge-danger">Atrasado</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Student History Section */}
        <div className="card">
          <div className="page-header mb-2">
            <h2 className="mb-0">Histórico de Empréstimos por Aluno</h2>
            <input
              type="text"
              placeholder="Pesquisar aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ maxWidth: '250px' }}
            />
          </div>

          {studentHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👤</div>
              <p>Nenhum aluno encontrado.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {studentHistory.map((student) => (
                <div key={student.id} className="card" style={{ backgroundColor: 'var(--color-gray-50)' }}>
                  <h3 className="mb-1">
                    {student.name}
                    <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '0.9rem' }}> ({student.email})</span>
                  </h3>

                  {student.loans.length === 0 ? (
                    <p className="text-muted" style={{ fontStyle: 'italic' }}>Nenhum empréstimo registrado.</p>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Livro</th>
                            <th>Data Empréstimo</th>
                            <th>Data Devolução</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {student.loans.map(loan => (
                            <tr key={loan.id}>
                              <td>{loan.book.title}</td>
                              <td>{new Date(loan.loanDate).toLocaleDateString('pt-BR')}</td>
                              <td>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString('pt-BR') : '-'}</td>
                              <td>{getStatusBadge(loan.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
