import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return new NextResponse(JSON.stringify({ error: 'Email e senha são obrigatórios' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.password !== password) {
            return new NextResponse(JSON.stringify({ error: 'Credenciais inválidas' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        // For now return basic user info and set a simple session cookie (userId)
        const { password: _p, ...safe } = user as any;
        const res = NextResponse.json(safe);
        // set cookie 'userId' (HttpOnly)
        res.cookies.set('userId', user.id, { httpOnly: true, path: '/' });
        return res;
    } catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ error: 'Erro ao autenticar' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
