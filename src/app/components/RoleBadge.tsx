"use client";

export type UserRole = 'ADMIN' | 'BIBLIOTECARIO' | 'ALUNO';

interface RoleBadgeProps {
  role: string;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  switch (role) {
    case "ADMIN":
      return <span className="badge badge-danger">Administrador</span>;
    case "BIBLIOTECARIO":
      return <span className="badge badge-info">Bibliotecário</span>;
    default:
      return <span className="badge badge-success">Aluno</span>;
  }
}
