import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

async function handler(req: NextRequest) {
  const token = await getToken({ req, secret });

  // 1. Check if user is authenticated and is an ADMIN
  if (!token || token.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ error: 'Acesso não autorizado: somente administradores podem registrar novos usuários.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  if (req.method === 'POST') {
    try {
      const { name, email, password, role } = await req.json();

      // 2. Validate input
      if (!name || !email || !password || !role) {
        return new NextResponse(JSON.stringify({ error: 'Nome, email, senha e função são obrigatórios' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      // 3. Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return new NextResponse(JSON.stringify({ error: 'Email já cadastrado' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }

      // 4. Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 5. Create the new user
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role, // Role is now provided in the request body
        },
      });

      // 6. Return the new user without the password
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
