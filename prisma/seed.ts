import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/home/sarlo/libFraga/LibFraga/prisma/dev.db'
    }
  }
})

async function main() {
  console.log('Iniciando seed...')

  await prisma.user.deleteMany()
  console.log('Usuários anteriores removidos')

  await prisma.user.create({
    data: { name: 'Administrador', email: 'admin@teste.com', password: '123456', role: 'admin' }
  })
  await prisma.user.create({
    data: { name: 'Bibliotecário', email: 'bibliotecario@teste.com', password: '123456', role: 'bibliotecario' }
  })
  await prisma.user.create({
    data: { name: 'Aluno Teste', email: 'aluno@teste.com', password: '123456', role: 'aluno' }
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
