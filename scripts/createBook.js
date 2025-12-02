const { PrismaClient } = require('../src/generated/prisma');

async function main() {
    const prisma = new PrismaClient();
    try {
        const newBook = await prisma.book.create({
            data: {
                title: 'Teste Automático',
                author: 'Tester',
                isbn: `ISBN-${Date.now()}`,
                quantity: 3,
                available: 3,
            }
        });
        console.log('Created book:', newBook);
    } catch (e) {
        console.error('ERROR creating book:', e);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

main();
