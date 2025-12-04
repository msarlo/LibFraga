"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

function getRoleBadge(role: string) {
    switch (role) {
        case "ADMIN":
            return <span className="badge badge-danger">Administrador</span>;
        case "BIBLIOTECARIO":
            return <span className="badge badge-info">Bibliotecário</span>;
        default:
            return <span className="badge badge-success">Aluno</span>;
    }
}

export default function UsersPage() {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        const role = session?.user?.role;
        if (role !== 'ADMIN' && role !== 'BIBLIOTECARIO') {
            router.push('/');
            return;
        }

        async function fetchUsers() {
            try {
                const res = await fetch('/api/users');
                if (!res.ok) throw new Error('Falha ao carregar usuários');
                const list = await res.json();
                setUsers(list);
            } catch (e: any) {
                setError(e.message || 'Erro');
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, [status, session, router]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm.trim() ||
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term);

            const matchesRole = !roleFilter || user.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    const handleDelete = async (userId: string) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            setUsers(users.filter(user => user.id !== userId));
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <span>Carregando usuários...</span>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-error">{error}</div>;
    }

    const isAdmin = session?.user?.role === 'ADMIN';

    return (
        <div>
            <div className="page-header">
                <h2>Gerenciamento de Usuários</h2>
                {isAdmin && (
                    <Link href="/users/register" className="btn btn-primary">
                        Novo Usuário
                    </Link>
                )}
            </div>

            <div className="card mb-3">
                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input"
                        style={{ maxWidth: '300px' }}
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="input"
                        style={{ maxWidth: '180px' }}
                    >
                        <option value="">Todas as funções</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="BIBLIOTECARIO">Bibliotecário</option>
                        <option value="ALUNO">Aluno</option>
                    </select>
                    {(searchTerm || roleFilter) && (
                        <span className="text-muted">
                            {filteredUsers.length} de {users.length} usuários
                        </span>
                    )}
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Função</th>
                            {isAdmin && <th>Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <Link href={`/users/${u.id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
                                            {u.name}
                                        </Link>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>{getRoleBadge(u.role)}</td>
                                    {isAdmin && (
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(u.id)}
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isAdmin ? 4 : 3}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">👤</div>
                                        <p>
                                            {searchTerm || roleFilter
                                                ? 'Nenhum usuário encontrado com os filtros aplicados.'
                                                : 'Nenhum usuário cadastrado.'}
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
