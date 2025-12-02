import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const userId = request.cookies.get('userId')?.value;
        if (!userId) {
            return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return new NextResponse(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        const { password: _p, ...safe } = user as any;
        return NextResponse.json(safe);
    } catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ error: 'Erro ao buscar usuário' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
