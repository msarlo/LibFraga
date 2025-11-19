# Notas de Implementação - LibFraga

## Visão Geral
Este documento descreve as decisões de implementação e como o sistema atende aos requisitos especificados.

## Requisitos Atendidos

### 1. Usuários (adm, bibliotecário, aluno)

#### ✅ Apenas admin pode cadastrar outro usuário
- Implementado através do método `can_register_users()` na classe `User`
- O método `register_user()` verifica essa permissão antes de criar usuários
- Lança `PermissionError` se não autorizado
- **Testado em**: `test_admin_can_register_user`, `test_student_cannot_register_user`

#### ✅ Bibliotecário e admin podem realizar todas as ações a partir da (2)
- Métodos `can_manage_books()` e `can_manage_loans()` verificam permissões
- Ambos retornam `True` para ADMIN e LIBRARIAN
- **Testado em**: `test_admin_and_librarian_can_manage_books`, `test_admin_and_librarian_can_manage_loans`

#### ✅ Aluno só pode consultar (6.1) para ele mesmo e consultar os próprios dados cadastrais
- `report_books_by_student()` verifica se o aluno está consultando seus próprios dados
- `get_user_info()` também verifica permissões
- Lança `PermissionError` se tentar acessar dados de outros
- **Testado em**: `test_student_can_see_own_loans`, `test_student_cannot_see_others_loans`, `test_student_can_see_own_data`, `test_student_cannot_see_others_data`

### 2. Livros ✅
- Classe `Book` implementada com:
  - ID, título, autor, ISBN, quantidade total e disponível
  - Métodos para emprestar e devolver exemplares
  - Verificação de disponibilidade
- Gerenciamento completo via `LibrarySystem.add_book()`, `get_book()`, `list_books()`, `list_available_books()`
- **Testado em**: `TestBook` (4 testes)

### 3. Empréstimo de livros ✅
- Classe `Loan` implementada com:
  - ID do empréstimo, usuário e livro
  - Data do empréstimo e data prevista de devolução (14 dias)
  - Status de devolução
- Método `create_loan()` em `LibrarySystem`
- Atualiza automaticamente a disponibilidade do livro
- **Testado em**: `test_create_loan`, `test_cannot_loan_unavailable_book`

### 4. Devolução de livros (multa por devolução) ✅
- Método `return_book()` na classe `Loan`
- Calcula automaticamente multa se devolvido após a data prevista
- Multa: R$ 1,00 por dia de atraso
- Método `return_book()` em `LibrarySystem` registra a devolução
- Atualiza disponibilidade do livro automaticamente
- **Testado em**: `test_return_book_no_fine`, `test_return_book_with_fine`, `test_calculate_fine_with_delay`

### 5. Pagamentos de multa ✅
- Classe `Payment` implementada
- Método `pay_fine()` em `LibrarySystem`
- Valida se o valor pago é suficiente
- Marca multa como paga no empréstimo
- **Testado em**: `test_pay_fine`

### 6. Relatórios

#### ✅ 6.1 Livros emprestados por aluno
- Método `report_books_by_student(user_id)` em `LibrarySystem`
- Alunos só podem consultar seus próprios empréstimos
- Admin e bibliotecário podem consultar qualquer aluno
- Retorna lista com todos os empréstimos do aluno, incluindo:
  - Informações do empréstimo
  - Título e autor do livro
  - Status (pendente/devolvido)
  - Se está atrasado
  - Multa (se houver)
- **Testado em**: `test_student_can_see_own_loans`, `test_student_cannot_see_others_loans`

#### ✅ 6.2 Livros em atraso
- Método `report_overdue_books()` em `LibrarySystem`
- Apenas admin e bibliotecário podem acessar
- Retorna lista de todos os empréstimos atrasados com:
  - Nome do aluno
  - Título do livro
  - Dias de atraso
  - Multa atual
  - Status do pagamento
- **Testado em**: `test_report_overdue_books`, `test_student_cannot_see_overdue_report`

## Arquitetura

### Classes Principais

1. **User**: Representa um usuário do sistema
   - Atributos: user_id, name, email, password, role
   - Métodos de verificação de permissões

2. **Book**: Representa um livro
   - Controle de quantidade total e disponível
   - Métodos para emprestar/devolver

3. **Loan**: Representa um empréstimo
   - Cálculo automático de datas e multas
   - Verificação de atraso

4. **Payment**: Representa um pagamento de multa
   - Registro de valor e data

5. **LibrarySystem**: Sistema principal
   - Gerencia todos os usuários, livros, empréstimos e pagamentos
   - Controla autenticação e autorização
   - Implementa todas as regras de negócio

### Segurança

- **Controle de Acesso Baseado em Papéis (RBAC)**
  - Cada operação verifica as permissões do usuário atual
  - Lança exceções apropriadas quando não autorizado

- **Isolamento de Dados**
  - Alunos não podem acessar dados de outros alunos
  - Validação em todos os métodos sensíveis

- **Validação de Entrada**
  - Verificação de existência de usuários e livros
  - Validação de disponibilidade antes de emprestar
  - Validação de valores em pagamentos

## Testes

### Cobertura de Testes
- **34 testes** cobrindo todos os requisitos
- Testes de unidade para cada classe
- Testes de integração para o sistema completo
- Testes de permissões e segurança

### Categorias de Testes
1. **TestUser** (4 testes): Criação e permissões de usuários
2. **TestBook** (4 testes): Gerenciamento de livros
3. **TestLoan** (7 testes): Empréstimos e cálculo de multas
4. **TestLibrarySystem** (19 testes): Integração completa e permissões

### Execução
```bash
python -m unittest test_library_system.py -v
```

## Uso

### CLI Interativo
```bash
python cli.py
```

### Demonstração Completa
```bash
python demo.py
```

### Uso Programático
Ver exemplos no README.md e em demo.py

## Melhorias Futuras Sugeridas

1. **Persistência de Dados**
   - Adicionar suporte a banco de dados (SQLite, PostgreSQL)
   - Salvar/carregar estado do sistema

2. **Segurança Avançada**
   - Hash de senhas com bcrypt ou argon2
   - Tokens de sessão
   - Logs de auditoria

3. **Interface Web**
   - Flask ou Django para interface web
   - API REST para integração

4. **Recursos Adicionais**
   - Reservas de livros
   - Renovação de empréstimos
   - Histórico completo de transações
   - Notificações de atraso por email

5. **Relatórios Adicionais**
   - Livros mais emprestados
   - Alunos com mais empréstimos
   - Receita de multas por período
   - Estatísticas gerais

## Conclusão

Todos os requisitos especificados no problema foram implementados e testados:
- ✅ Sistema de usuários com 3 tipos
- ✅ Controle de permissões adequado
- ✅ Gerenciamento completo de livros
- ✅ Sistema de empréstimos
- ✅ Devolução com cálculo de multas
- ✅ Pagamento de multas
- ✅ Relatórios 6.1 e 6.2
- ✅ 34 testes passando
- ✅ Segurança verificada (0 vulnerabilidades)
- ✅ Documentação completa
