"use client";

import { useState, useEffect } from "react";
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

export default function LoansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role === "ALUNO") {
      if (session?.user?.role === "ALUNO") {
        router.push("/");
        return;
      }
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

  if (status === "loading" || loading)
    return <div className="container">Carregando...</div>;

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>Gerenciamento de Empréstimos</h1>
        <Link href="/loans/new" className="btn btn-primary">
          Novo Empréstimo
        </Link>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="card-grid" style={{ gridTemplateColumns: "1fr" }}>
        {" "}
        {/* List view style */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
              <th style={{ padding: "1rem" }}>Livro</th>
              <th style={{ padding: "1rem" }}>Aluno</th>
              <th style={{ padding: "1rem" }}>Data Empréstimo</th>
              <th style={{ padding: "1rem" }}>Data Devolução Prevista</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "1rem" }}>{loan.book.title}</td>
                <td style={{ padding: "1rem" }}>{loan.user.name}</td>
                <td style={{ padding: "1rem" }}>
                  {new Date(loan.loanDate).toLocaleDateString("pt-BR")}
                </td>
                <td style={{ padding: "1rem" }}>
                  {new Date(loan.dueDate).toLocaleDateString("pt-BR")}
                </td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      backgroundColor: loan.returnDate
                        ? "#d4edda"
                        : new Date(loan.dueDate) < new Date()
                        ? "#f8d7da"
                        : "#fff3cd",
                      color: loan.returnDate
                        ? "#155724"
                        : new Date(loan.dueDate) < new Date()
                        ? "#721c24"
                        : "#856404",
                      fontSize: "0.875rem",
                    }}
                  >
                    {loan.returnDate
                      ? "Devolvido"
                      : new Date(loan.dueDate) < new Date()
                      ? "Atrasado"
                      : "Em andamento"}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>
                  {!loan.returnDate && (
                    <button
                      onClick={() => handleReturn(loan.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                    >
                      Devolver
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#666",
                  }}
                >
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
