"""
Exemplo de Demonstração do Sistema de Biblioteca LibFraga
Este script demonstra todas as funcionalidades principais do sistema.
"""

from library_system import LibrarySystem, UserRole
from datetime import datetime, timedelta


def print_section(title):
    """Imprime um cabeçalho de seção"""
    print("\n" + "=" * 60)
    print(f" {title} ".center(60, "="))
    print("=" * 60 + "\n")


def main():
    print_section("DEMONSTRAÇÃO DO SISTEMA LIBFRAGA")
    
    # Criar sistema
    system = LibrarySystem()
    print("✅ Sistema criado com administrador padrão")
    
    # 1. LOGIN COMO ADMINISTRADOR
    print_section("1. LOGIN COMO ADMINISTRADOR")
    admin = system.login("admin@libfraga.com", "admin123")
    print(f"✅ Login realizado: {admin.name} ({admin.role.value})")
    
    # 2. CADASTRAR USUÁRIOS (apenas admin pode)
    print_section("2. CADASTRAR USUÁRIOS")
    
    librarian = system.register_user(
        "lib001",
        "Maria Silva",
        "maria@libfraga.com",
        "senha123",
        UserRole.LIBRARIAN
    )
    print(f"✅ Bibliotecária cadastrada: {librarian.name}")
    
    student1 = system.register_user(
        "stu001",
        "João Santos",
        "joao@email.com",
        "senha123",
        UserRole.STUDENT
    )
    print(f"✅ Aluno cadastrado: {student1.name}")
    
    student2 = system.register_user(
        "stu002",
        "Ana Costa",
        "ana@email.com",
        "senha123",
        UserRole.STUDENT
    )
    print(f"✅ Aluna cadastrada: {student2.name}")
    
    # 3. ADICIONAR LIVROS
    print_section("3. ADICIONAR LIVROS")
    
    book1 = system.add_book(
        "book001",
        "Clean Code",
        "Robert Martin",
        "9780132350884",
        3
    )
    print(f"✅ Livro adicionado: {book1.title} (Qtd: {book1.quantity})")
    
    book2 = system.add_book(
        "book002",
        "Design Patterns",
        "Gang of Four",
        "9780201633610",
        2
    )
    print(f"✅ Livro adicionado: {book2.title} (Qtd: {book2.quantity})")
    
    book3 = system.add_book(
        "book003",
        "Refactoring",
        "Martin Fowler",
        "9780201485677",
        5
    )
    print(f"✅ Livro adicionado: {book3.title} (Qtd: {book3.quantity})")
    
    # 4. CRIAR EMPRÉSTIMOS
    print_section("4. CRIAR EMPRÉSTIMOS")
    
    loan1 = system.create_loan("loan001", "stu001", "book001")
    print(f"✅ Empréstimo criado: {student1.name} - {book1.title}")
    print(f"   Data: {loan1.loan_date.strftime('%d/%m/%Y')}")
    print(f"   Devolução: {loan1.due_date.strftime('%d/%m/%Y')}")
    
    loan2 = system.create_loan("loan002", "stu001", "book002")
    print(f"✅ Empréstimo criado: {student1.name} - {book2.title}")
    
    loan3 = system.create_loan("loan003", "stu002", "book003")
    print(f"✅ Empréstimo criado: {student2.name} - {book3.title}")
    
    # 5. CRIAR EMPRÉSTIMO ATRASADO (para demonstração)
    print_section("5. SIMULAR EMPRÉSTIMO ATRASADO")
    
    past_date = datetime.now() - timedelta(days=20)
    loan4 = system.loans["loan004"] = system.loans["loan004"] = type(loan1)(
        "loan004", "stu001", "book001", past_date
    )
    book1.available -= 1  # Reduzir disponibilidade manualmente para simulação
    print(f"⚠️  Empréstimo atrasado criado para demonstração")
    print(f"   Data do empréstimo: {loan4.loan_date.strftime('%d/%m/%Y')}")
    print(f"   Deveria ter sido devolvido em: {loan4.due_date.strftime('%d/%m/%Y')}")
    print(f"   Dias de atraso: {loan4.days_overdue()}")
    
    # 6. RELATÓRIO: LIVROS EMPRESTADOS POR ALUNO (6.1)
    print_section("6.1 RELATÓRIO: LIVROS EMPRESTADOS POR ALUNO")
    
    loans_student1 = system.report_books_by_student("stu001")
    print(f"📚 Empréstimos de {student1.name}:")
    for loan in loans_student1:
        status = "Devolvido" if loan['return_date'] else "Pendente"
        atraso = " (ATRASADO!)" if loan['is_overdue'] else ""
        print(f"   - {loan.get('book_title', 'N/A')}: {status}{atraso}")
    
    # 7. RELATÓRIO: LIVROS EM ATRASO (6.2)
    print_section("6.2 RELATÓRIO: LIVROS EM ATRASO")
    
    overdue_loans = system.report_overdue_books()
    print(f"⚠️  Total de empréstimos em atraso: {len(overdue_loans)}")
    for loan in overdue_loans:
        print(f"\n   Aluno: {loan.get('student_name', 'N/A')}")
        print(f"   Livro: {loan.get('book_title', 'N/A')}")
        print(f"   Dias de atraso: {loan['days_overdue']}")
        print(f"   Multa atual: R$ {loan['current_fine']:.2f}")
    
    # 8. DEVOLUÇÃO COM MULTA
    print_section("8. DEVOLUÇÃO COM MULTA")
    
    fine = system.return_book("loan004")
    print(f"✅ Devolução registrada")
    print(f"   Multa aplicada: R$ {fine:.2f}")
    
    # 9. PAGAMENTO DE MULTA
    print_section("9. PAGAMENTO DE MULTA")
    
    payment = system.pay_fine("pay001", "loan004", fine)
    print(f"✅ Pagamento registrado")
    print(f"   Valor: R$ {payment.amount:.2f}")
    print(f"   Data: {payment.payment_date.strftime('%d/%m/%Y %H:%M')}")
    
    # 10. DEVOLUÇÃO SEM MULTA
    print_section("10. DEVOLUÇÃO SEM MULTA")
    
    fine = system.return_book("loan001")
    print(f"✅ Devolução registrada")
    if fine == 0:
        print(f"   Sem multa - livro devolvido no prazo!")
    
    # 11. TESTAR PERMISSÕES DE ALUNO
    print_section("11. TESTAR PERMISSÕES DE ALUNO")
    
    system.logout()
    system.login("joao@email.com", "senha123")
    print(f"✅ Login como aluno: {student1.name}")
    
    # Aluno pode ver seus próprios dados
    user_info = system.get_user_info("stu001")
    print(f"✅ Aluno pode ver seus dados: {user_info['name']}")
    
    # Aluno pode ver seus próprios empréstimos
    my_loans = system.report_books_by_student("stu001")
    print(f"✅ Aluno pode ver seus empréstimos: {len(my_loans)} empréstimo(s)")
    
    # Aluno NÃO pode ver empréstimos de outros
    try:
        system.report_books_by_student("stu002")
        print("❌ ERRO: Aluno não deveria ver empréstimos de outros!")
    except PermissionError:
        print("✅ Aluno não pode ver empréstimos de outros (correto)")
    
    # Aluno NÃO pode ver relatório de atrasos
    try:
        system.report_overdue_books()
        print("❌ ERRO: Aluno não deveria ver relatório de atrasos!")
    except PermissionError:
        print("✅ Aluno não pode ver relatório de atrasos (correto)")
    
    # Aluno NÃO pode cadastrar outros usuários
    try:
        system.register_user("test", "Test", "test@email.com", "pass", UserRole.STUDENT)
        print("❌ ERRO: Aluno não deveria cadastrar usuários!")
    except PermissionError:
        print("✅ Aluno não pode cadastrar usuários (correto)")
    
    # 12. TESTAR PERMISSÕES DE BIBLIOTECÁRIO
    print_section("12. TESTAR PERMISSÕES DE BIBLIOTECÁRIO")
    
    system.logout()
    system.login("maria@libfraga.com", "senha123")
    print(f"✅ Login como bibliotecária: {librarian.name}")
    
    # Bibliotecário pode adicionar livros
    book4 = system.add_book("book004", "Test Book", "Author", "123456", 1)
    print(f"✅ Bibliotecária pode adicionar livros: {book4.title}")
    
    # Bibliotecário pode ver relatório de atrasos
    overdue = system.report_overdue_books()
    print(f"✅ Bibliotecária pode ver relatório de atrasos: {len(overdue)} item(s)")
    
    # Bibliotecário NÃO pode cadastrar usuários
    try:
        system.register_user("test", "Test", "test@email.com", "pass", UserRole.STUDENT)
        print("❌ ERRO: Bibliotecário não deveria cadastrar usuários!")
    except PermissionError:
        print("✅ Bibliotecária não pode cadastrar usuários (correto)")
    
    # RESUMO FINAL
    print_section("RESUMO FINAL")
    
    print(f"📊 Estatísticas do Sistema:")
    print(f"   - Usuários cadastrados: {len(system.users)}")
    print(f"   - Livros cadastrados: {len(system.books)}")
    print(f"   - Empréstimos criados: {len(system.loans)}")
    print(f"   - Pagamentos registrados: {len(system.payments)}")
    
    # Listar livros disponíveis
    available_books = system.list_available_books()
    print(f"\n📚 Livros disponíveis: {len(available_books)}")
    for book in available_books:
        print(f"   - {book.title}: {book.available} disponível(is)")
    
    print("\n" + "=" * 60)
    print("✅ DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
