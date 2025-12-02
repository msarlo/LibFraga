const { PrismaClient } = require('../src/generated/prisma');

async function main() {
    const prisma = new PrismaClient();
    try {
        const count = await prisma.book.count();
        console.log('books count =', count);
    } catch (e) {
        console.error('ERROR:', e.message);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

main();
