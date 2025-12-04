import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.resolve(__dirname, 'dev.db')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
})

async function main() {
  console.log('Iniciando seed...')

  await prisma.user.deleteMany()
  console.log('Usuários anteriores removidos')

  const hashedPassword = await bcrypt.hash('123456', 10)

  await prisma.user.create({
    data: { name: 'Administrador', email: 'admin@teste.com', password: hashedPassword, role: 'ADMIN' }
  })
  await prisma.user.create({
    data: { name: 'Bibliotecário', email: 'bibliotecario@teste.com', password: hashedPassword, role: 'BIBLIOTECARIO' }
  })
  await prisma.user.create({
    data: { name: 'Aluno Teste', email: 'aluno@teste.com', password: hashedPassword, role: 'ALUNO' }
  })

  console.log('3 usuários criados:')
  console.log('  - admin@teste.com (senha: 123456)')
  console.log('  - bibliotecario@teste.com (senha: 123456)')
  console.log('  - aluno@teste.com (senha: 123456)')
  console.log('Seed concluído!')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
