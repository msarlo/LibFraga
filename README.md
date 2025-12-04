Modelos do Banco de Dados
Criei 4 modelos principais no prisma/schema.prisma:
1. User (Usuários)
id: UUID único
name: Nome do usuário
email: Email único
password: Senha (hash)
role: ADMIN | BIBLIOTECARIO | ALUNO
Relações: loans[], fines[]
2. Book (Livros)
id: UUID único
title: Título do livro
author: Autor
isbn: ISBN único
quantity: Quantidade total
available: Quantidade disponível
Relações: loans[]
3. Loan (Empréstimos)
id: UUID único
bookId: Referência ao livro
userId: Referência ao usuário
loanDate: Data do empréstimo
dueDate: Data de devolução
returnDate: Data de devolução real (opcional)
status: ACTIVE | RETURNED | OVERDUE
Relações: book, user, fine?
4. Fine (Multas)
id: UUID único
loanId: Referência ao empréstimo (única)
userId: Referência ao usuário
amount: Valor da multa
paid: Se foi paga
paidAt: Data do pagamento (opcional)
Relações: loan, user


## Usuários padrão que criei para teste

Administrador: admin@teste.com (Senha: 123456)

Bibliotecário: bibliotecario@teste.com (Senha: 123456`)

Aluno: aluno@teste.com (Senha: 123456)



## Como rodar essa budega???:

- Clone/copie o projeto.
- Crie o arquivo .env com o conteúdo abaixo. (tenha em mente que ali está o caminho absoluto do projeto, altere-o pro caminho do projeto na sua máquina)
    DATABASE_URL="file:C:/Users/office/Documents/Gabriel_Leao/LibFraga/prisma/dev.db"
    NEXTAUTH_SECRET="supersecretkey123"
    NEXTAUTH_URL=http://localhost:3000
- Instale as dependências: npm install.
- Gere o cliente do Prisma: npx prisma generate.
- (Opcional) Se quiser começar com o banco zerado ou aplicar migrações: npx prisma migrate dev.
- Rode o projeto: npm run dev.