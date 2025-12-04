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

  // Re-fetch when search term changes (with debounce could be better, but simple for now)
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

  if (status === 'loading' || loading) return <div className="container">Carregando...</div>;

  return (
    <div className="container">
      <h1>Relatórios</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Overdue Books Section */}
        <div className="card" style={{ textAlign: 'left' }}>
          <h2>Livros em Atraso (Pendências)</h2>
          {overdueLoans.length === 0 ? (
            <p>Nenhuma pendência encontrada.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {overdueLoans.map((loan) => (
                <li key={loan.id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                  <strong>{loan.user.name}</strong> ({loan.user.email})<br/>
                  <span style={{ color: '#721c24', fontWeight: 'bold' }}>Atrasado: {loan.book.title}</span><br/>
                  <small>Vencimento: {new Date(loan.dueDate).toLocaleDateString('pt-BR')}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Student History Section */}
        <div className="card" style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Histórico de Empréstimos por Aluno</h2>
            <input 
                type="text" 
                placeholder="Pesquisar aluno..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '250px' }}
            />
          </div>
          
          {studentHistory.length === 0 ? (
            <p>Nenhum aluno encontrado.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {studentHistory.map((student) => (
                <div key={student.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', backgroundColor: '#fafafa' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{student.name} <small style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>({student.email})</small></h3>
                  
                  {student.loans.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: '#888', fontSize: '0.9rem' }}>Nenhum empréstimo registrado.</p>
                  ) : (
                    <table className="table" style={{ fontSize: '0.9rem' }}>
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
                                    <td>
                                        <span style={{ 
                                            padding: '2px 6px', 
                                            borderRadius: '4px', 
                                            fontSize: '0.8rem',
                                            backgroundColor: loan.status === 'RETURNED' ? '#d4edda' : loan.status === 'OVERDUE' ? '#f8d7da' : '#cce5ff',
                                            color: loan.status === 'RETURNED' ? '#155724' : loan.status === 'OVERDUE' ? '#721c24' : '#004085'
                                        }}>
                                            {loan.status === 'RETURNED' ? 'Devolvido' : loan.status === 'OVERDUE' ? 'Atrasado' : 'Ativo'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
