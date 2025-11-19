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
