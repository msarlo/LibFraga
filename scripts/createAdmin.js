const { PrismaClient } = require('../src/generated/prisma');

async function main() {
    const prisma = new PrismaClient();
    try {
        // Check if admin already exists
        const existing = await prisma.user.findUnique({ where: { email: 'admin@teste.com' } });
        if (existing) {
            console.log('Admin already exists:', { id: existing.id, email: existing.email, role: existing.role });
            return;
        }

        const admin = await prisma.user.create({
            data: {
                name: 'Administrador Teste',
                email: 'admin@teste.com',
                password: '123',
                role: 'admin'
            }
        });
        console.log('Created admin:', { id: admin.id, email: admin.email, role: admin.role });
    } catch (e) {
        console.error('ERROR creating admin:', e.message || e);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

main();
