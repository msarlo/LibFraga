"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidIsbn } from '@/lib/isbn';

export default function AuthForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                const body = await res.json();
                throw new Error(body.error || 'Erro ao entrar');
            }
            // on success, navigate to /books (or dashboard)
            router.push('/books');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // register removed — only login is supported on this page

    return (
        <div style={{ maxWidth: 480, margin: '2rem auto', padding: '1.5rem', border: '1px solid #eee', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>Entrar</h2>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 8 }}>
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: 8 }}>
                    <label>Senha</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
                </div>
            </form>

            <p style={{ marginTop: 12, color: '#666' }}>
                Observe: este é um protótipo — senhas são armazenadas em texto puro. Para produção, implemente hash e tokens.
            </p>
        </div>
    );
}
