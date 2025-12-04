"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RoleBadge from '../components/RoleBadge';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

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

    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
    };

    const hasActiveFilters = searchTerm || roleFilter;

    if (status === 'loading' || loading) {
        return <LoadingState message="Carregando usuários..." />;
    }

    if (error) {
        return <div className="alert alert-error">{error}</div>;
    }

    const isAdmin = session?.user?.role === 'ADMIN';

    return (
        <div>
            <PageHeader
                title="Gerenciamento de Usuários"
                actionLabel="Novo Usuário"
                actionHref="/users/register"
                showAction={isAdmin}
            />

            <div className="filter-card">
                <div className="filter-row">
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
                    {hasActiveFilters && (
                        <>
                            <span className="filter-count">
                                {filteredUsers.length} de {users.length} usuários
                            </span>
                            <button
                                onClick={clearFilters}
                                className="btn btn-secondary btn-sm"
                            >
                                Limpar filtros
                            </button>
                        </>
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
                                        <Link href={`/users/${u.id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: '600' }}>
                                            {u.name}
                                        </Link>
                                    </td>
                                    <td>{u.email}</td>
                                    <td><RoleBadge role={u.role} /></td>
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
                                    <EmptyState
                                        icon="👤"
                                        message="Nenhum usuário cadastrado."
                                        filteredMessage="Nenhum usuário encontrado com os filtros aplicados."
                                        hasFilters={!!hasActiveFilters}
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
