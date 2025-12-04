"use client";

export type LoanStatus = 'RETURNED' | 'OVERDUE' | 'ACTIVE';

interface StatusBadgeProps {
  returnDate?: string | null;
  dueDate?: string;
}

export function getStatusFromLoan(returnDate: string | null | undefined, dueDate: string): LoanStatus {
  if (returnDate) return 'RETURNED';
  if (new Date(dueDate) < new Date()) return 'OVERDUE';
  return 'ACTIVE';
}

export default function StatusBadge({ returnDate, dueDate }: StatusBadgeProps) {
  if (returnDate) {
    return <span className="badge badge-success">Devolvido</span>;
  }
  if (dueDate && new Date(dueDate) < new Date()) {
    return <span className="badge badge-danger">Atrasado</span>;
  }
  return <span className="badge badge-warning">Em andamento</span>;
}

// Versão para uso com status já calculado (usado em reports)
export function StatusBadgeByStatus({ status }: { status: string }) {
  switch (status) {
    case 'RETURNED':
      return <span className="badge badge-success">Devolvido</span>;
    case 'OVERDUE':
      return <span className="badge badge-danger">Atrasado</span>;
    default:
      return <span className="badge badge-info">Ativo</span>;
  }
}
