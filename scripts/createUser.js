const { PrismaClient } = require('../src/generated/prisma');

async function main() {
    const prisma = new PrismaClient();
    try {
        const u = await prisma.user.create({
            data: { name: 'Teste User', email: `teste${Date.now()}@local`, password: 'pass', role: 'bibliotecario' }
        });
        console.log('Created user:', { ...u, password: undefined });
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
