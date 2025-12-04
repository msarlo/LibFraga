import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

async function handler(req: NextRequest) {
  const token = await getToken({ req, secret });

  if (!token || token.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ error: 'Acesso não autorizado: somente administradores podem registrar novos usuários.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  if (req.method === 'POST') {
    try {
      const { name, email, password, role } = await req.json();

      if (!name || !email || !password || !role) {
        return new NextResponse(JSON.stringify({ error: 'Nome, email, senha e função são obrigatórios' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return new NextResponse(JSON.stringify({ error: 'Email já cadastrado' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role, 
        },
      });

      const { password: _, ...userWithoutPassword } = newUser;
      return new NextResponse(JSON.stringify(userWithoutPassword), { status: 201, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor ao cadastrar usuário' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  } else {
    return new NextResponse(JSON.stringify({ error: `Método ${req.method} não permitido` }), { status: 405, headers: { 'Content-Type': 'application/json', 'Allow': 'POST' } });
  }
}

export { handler as POST };
