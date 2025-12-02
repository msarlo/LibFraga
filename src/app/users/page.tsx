"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

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

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        const role = session?.user?.role;
        if (role !== 'ADMIN' && role !== 'BIBLIOTECARIO') {
            router.push('/'); // Redirect unauthorized users
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

    if (status === 'loading' || loading) return <div className="container">Carregando...</div>;
    if (error) return <div className="container" style={{ color: 'red' }}>{error}</div>;

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
                        {users.length > 0 ? (
                            users.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <Link href={`/users/${u.id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
                                            {u.name}
                                        </Link>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>
                                    {isAdmin && (
                                        <td>
                                            {/* Placeholder for edit/delete actions if needed */}
                                            <button 
                                                className="btn btn-danger" 
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.9rem' }}
                                                onClick={async () => {
                                                    if(confirm('Tem certeza que deseja excluir este usuário?')) {
                                                        await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
                                                        setUsers(users.filter(user => user.id !== u.id));
                                                    }
                                                }}
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center' }}>
                                    Nenhum usuário encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
