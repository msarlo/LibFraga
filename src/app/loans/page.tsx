"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Loan {
  id: string;
  book: { title: string };
  user: { name: string };
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
}

function getStatusBadge(loan: Loan) {
  if (loan.returnDate) {
    return <span className="badge badge-success">Devolvido</span>;
  }
  if (new Date(loan.dueDate) < new Date()) {
    return <span className="badge badge-danger">Atrasado</span>;
  }
  return <span className="badge badge-warning">Em andamento</span>;
}

export default function LoansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [loanDateFrom, setLoanDateFrom] = useState("");
  const [loanDateTo, setLoanDateTo] = useState("");
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateTo, setDueDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role === "ALUNO") {
      router.push("/");
      return;
    }

    fetchLoans();
  }, [status, session, router]);

  const fetchLoans = async () => {
    try {
      const res = await fetch("/api/loans");
      if (!res.ok) throw new Error("Falha ao carregar empréstimos");
      const data = await res.json();
      setLoans(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        loan.book.title.toLowerCase().includes(term) ||
        loan.user.name.toLowerCase().includes(term);

      // Filtro de data de empréstimo
      const loanDate = new Date(loan.loanDate);
      const matchesLoanDateFrom = !loanDateFrom || loanDate >= new Date(loanDateFrom);
      const matchesLoanDateTo = !loanDateTo || loanDate <= new Date(loanDateTo + "T23:59:59");

      // Filtro de data de devolução prevista
      const dueDate = new Date(loan.dueDate);
      const matchesDueDateFrom = !dueDateFrom || dueDate >= new Date(dueDateFrom);
      const matchesDueDateTo = !dueDateTo || dueDate <= new Date(dueDateTo + "T23:59:59");

      // Filtro de status
      let matchesStatus = true;
      if (statusFilter) {
        if (statusFilter === "RETURNED") {
          matchesStatus = !!loan.returnDate;
        } else if (statusFilter === "OVERDUE") {
          matchesStatus = !loan.returnDate && new Date(loan.dueDate) < new Date();
        } else if (statusFilter === "ACTIVE") {
          matchesStatus = !loan.returnDate && new Date(loan.dueDate) >= new Date();
        }
      }

      return matchesSearch && matchesLoanDateFrom && matchesLoanDateTo &&
             matchesDueDateFrom && matchesDueDateTo && matchesStatus;
    });
  }, [loans, searchTerm, loanDateFrom, loanDateTo, dueDateFrom, dueDateTo, statusFilter]);

  const handleReturn = async (id: string) => {
    if (!confirm("Confirmar devolução do livro?")) return;

    try {
      const res = await fetch(`/api/loans/${id}/return`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao devolver livro");
      }

      fetchLoans();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLoanDateFrom("");
    setLoanDateTo("");
    setDueDateFrom("");
    setDueDateTo("");
    setStatusFilter("");
  };

  const hasActiveFilters = searchTerm || loanDateFrom || loanDateTo || dueDateFrom || dueDateTo || statusFilter;

  if (status === "loading" || loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Carregando empréstimos...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Gerenciamento de Empréstimos</h1>
        <Link href="/loans/new" className="btn btn-primary">
          Novo Empréstimo
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card mb-3">
        <div className="flex flex-col gap-2">
          {/* Primeira linha: pesquisa e status */}
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Pesquisar por livro ou aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ maxWidth: '300px' }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
              style={{ maxWidth: '180px' }}
            >
              <option value="">Todos os status</option>
              <option value="ACTIVE">Em andamento</option>
              <option value="OVERDUE">Atrasado</option>
              <option value="RETURNED">Devolvido</option>
            </select>
          </div>

          {/* Segunda linha: datas de empréstimo */}
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <span className="text-muted" style={{ minWidth: '140px' }}>Data Empréstimo:</span>
            <input
              type="date"
              value={loanDateFrom}
              onChange={(e) => setLoanDateFrom(e.target.value)}
              className="input"
              style={{ maxWidth: '160px' }}
            />
            <span className="text-muted">até</span>
            <input
              type="date"
              value={loanDateTo}
              onChange={(e) => setLoanDateTo(e.target.value)}
              className="input"
              style={{ maxWidth: '160px' }}
            />
          </div>

          {/* Terceira linha: datas de devolução */}
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <span className="text-muted" style={{ minWidth: '140px' }}>Devolução Prevista:</span>
            <input
              type="date"
              value={dueDateFrom}
              onChange={(e) => setDueDateFrom(e.target.value)}
              className="input"
              style={{ maxWidth: '160px' }}
            />
            <span className="text-muted">até</span>
            <input
              type="date"
              value={dueDateTo}
              onChange={(e) => setDueDateTo(e.target.value)}
              className="input"
              style={{ maxWidth: '160px' }}
            />
          </div>

          {/* Contador e limpar filtros */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-muted">
                {filteredLoans.length} de {loans.length} empréstimos
              </span>
              <button
                onClick={clearFilters}
                className="btn btn-secondary btn-sm"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Livro</th>
              <th>Aluno</th>
              <th>Data Empréstimo</th>
              <th>Devolução Prevista</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.length > 0 ? (
              filteredLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.book.title}</td>
                  <td>{loan.user.name}</td>
                  <td>{new Date(loan.loanDate).toLocaleDateString("pt-BR")}</td>
                  <td>{new Date(loan.dueDate).toLocaleDateString("pt-BR")}</td>
                  <td>{getStatusBadge(loan)}</td>
                  <td>
                    {!loan.returnDate && (
                      <button
                        onClick={() => handleReturn(loan.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        Devolver
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <p>
                      {hasActiveFilters
                        ? "Nenhum empréstimo encontrado com os filtros aplicados."
                        : "Nenhum empréstimo cadastrado."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
