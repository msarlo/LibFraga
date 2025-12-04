"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StatusBadge from "../../components/StatusBadge";
import RoleBadge from "../../components/RoleBadge";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";

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

export default function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role === "ALUNO" && session?.user?.id !== params.id) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, loansRes] = await Promise.all([
          fetch(`/api/users/${params.id}`),
          fetch(`/api/reports/loans-by-student/${params.id}`),
        ]);

        if (!userRes.ok) throw new Error("Falha ao carregar usuário");
        if (!loansRes.ok) throw new Error("Falha ao carregar histórico");

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
    if (!confirm("Confirmar pagamento da multa?")) return;

    try {
      const res = await fetch(`/api/fines/${fineId}`, {
        method: "PUT",
      });

      if (!res.ok) {
        throw new Error("Falha ao registrar pagamento");
      }

      const loansRes = await fetch(
        `/api/reports/loans-by-student/${params.id}`
      );
      const loansData = await loansRes.json();
      setLoans(loansData);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (status === "loading" || loading) {
    return <LoadingState message="Carregando perfil..." />;
  }

  if (!user) {
    return (
      <EmptyState
        icon="👤"
        message="Usuário não encontrado"
      />
    );
  }

  return (
    <div>
      <div className="card mb-3">
        <h1 className="mb-2">Perfil do Usuário</h1>
        <div className="flex flex-col gap-1">
          <p><strong>Nome:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Função:</strong> <RoleBadge role={user.role} /></p>
        </div>
      </div>

      <h2>Histórico de Empréstimos</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Livro</th>
              <th>Data Empréstimo</th>
              <th>Data Devolução</th>
              <th>Status</th>
              <th>Multa</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loans.length > 0 ? (
              loans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.book.title}</td>
                  <td>{new Date(loan.loanDate).toLocaleDateString("pt-BR")}</td>
                  <td>
                    {loan.returnDate
                      ? new Date(loan.returnDate).toLocaleDateString("pt-BR")
                      : new Date(loan.dueDate).toLocaleDateString("pt-BR") + " (Prevista)"}
                  </td>
                  <td>
                    <StatusBadge returnDate={loan.returnDate} dueDate={loan.dueDate} />
                  </td>
                  <td>
                    {loan.fine ? (
                      <span className={loan.fine.paid ? "text-success" : "text-danger"}>
                        R$ {loan.fine.amount.toFixed(2)} ({loan.fine.paid ? "Paga" : "Pendente"})
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {loan.fine &&
                      !loan.fine.paid &&
                      (session?.user?.role === "ADMIN" ||
                        session?.user?.role === "BIBLIOTECARIO") && (
                        <button
                          onClick={() => handlePayFine(loan.fine!.id)}
                          className="btn btn-success btn-sm"
                        >
                          Pagar Multa
                        </button>
                      )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon="📚"
                    message="Nenhum histórico de empréstimos encontrado."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
