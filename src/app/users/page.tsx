"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

export default function UsersPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function init() {
            try {
                const meRes = await fetch('/api/auth/me');
                if (!meRes.ok) {
                    router.push('/');
                    return;
                }
                const me = await meRes.json();
                setCurrentUser(me);
                if (!['admin', 'bibliotecario'].includes(me.role)) {
                    setError('Acesso negado: você não tem permissão para ver esta página.');
                    setLoading(false);
                    return;
                }

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

        init();
    }, [router]);

    if (loading) return <div>Carregando...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Usuários</h1>
            </div>

            <div className="feature-section">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
