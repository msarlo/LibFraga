"""
Interface de Linha de Comando para o Sistema de Biblioteca LibFraga
"""

from library_system import LibrarySystem, UserRole
from datetime import datetime


def print_separator():
    """Imprime uma linha separadora"""
    print("=" * 60)


def print_menu(options: list):
    """Imprime um menu de opções"""
    print_separator()
    for i, option in enumerate(options, 1):
        print(f"{i}. {option}")
    print("0. Voltar/Sair")
    print_separator()


def main():
    """Função principal do CLI"""
    system = LibrarySystem()
    
    print("\n" + "=" * 60)
    print(" SISTEMA DE BIBLIOTECA - LIBFRAGA ".center(60))
    print("=" * 60)
    
    # Login
    print("\nBem-vindo! Por favor, faça login.")
    print("(Use admin@libfraga.com / admin123 para o administrador padrão)")
    
    email = input("\nEmail: ").strip()
    password = input("Senha: ").strip()
    
    user = system.login(email, password)
    
    if not user:
        print("\n❌ Credenciais inválidas!")
        return
    
    print(f"\n✅ Login bem-sucedido! Bem-vindo(a), {user.name}")
    print(f"Tipo de usuário: {user.role.value}")
    
    # Menu principal baseado no tipo de usuário
    while True:
        print("\n" + "=" * 60)
        print(" MENU PRINCIPAL ".center(60))
        print_separator()
        
        if user.role == UserRole.STUDENT:
            # Menu para alunos
            print("1. Consultar meus dados cadastrais")
            print("2. Consultar meus empréstimos (Relatório 6.1)")
            print("0. Sair")
        else:
            # Menu para administradores e bibliotecários
            print("1. Gerenciar Usuários" if user.can_register_users() else "1. [Indisponível] Gerenciar Usuários")
            print("2. Gerenciar Livros")
            print("3. Gerenciar Empréstimos")
            print("4. Registrar Devolução")
            print("5. Registrar Pagamento de Multa")
            print("6. Relatórios")
            print("0. Sair")
        
        print_separator()
        choice = input("Escolha uma opção: ").strip()
        
        if choice == "0":
            print("\n👋 Até logo!")
            break
        
        # Opções específicas para alunos
        if user.role == UserRole.STUDENT:
            if choice == "1":
                # Consultar dados cadastrais
                try:
                    user_info = system.get_user_info(user.user_id)
                    print("\n📋 DADOS CADASTRAIS")
                    print_separator()
                    print(f"ID: {user_info['user_id']}")
                    print(f"Nome: {user_info['name']}")
                    print(f"Email: {user_info['email']}")
                    print(f"Tipo: {user_info['role']}")
                    print(f"Cadastrado em: {user_info['created_at']}")
                except Exception as e:
                    print(f"\n❌ Erro: {e}")
            
            elif choice == "2":
                # Consultar empréstimos do aluno
                try:
                    loans = system.report_books_by_student(user.user_id)
                    print("\n📚 MEUS EMPRÉSTIMOS")
                    print_separator()
                    
                    if not loans:
                        print("Você não possui empréstimos registrados.")
                    else:
                        for loan in loans:
                            print(f"\nLivro: {loan.get('book_title', 'N/A')}")
                            print(f"Autor: {loan.get('book_author', 'N/A')}")
                            print(f"Data do empréstimo: {loan['loan_date']}")
                            print(f"Data de devolução: {loan['due_date']}")
                            if loan['return_date']:
                                print(f"Devolvido em: {loan['return_date']}")
                            else:
                                print("Status: Pendente")
                            if loan['is_overdue']:
                                print("⚠️  ATRASADO!")
                            if loan['fine_amount'] > 0:
                                status = "Paga" if loan['fine_paid'] else "Pendente"
                                print(f"Multa: R$ {loan['fine_amount']:.2f} ({status})")
                            print("-" * 40)
                except Exception as e:
                    print(f"\n❌ Erro: {e}")
        
        # Opções para administradores e bibliotecários
        else:
            if choice == "1" and user.can_register_users():
                # Gerenciar usuários (apenas admin)
                print("\n👥 GERENCIAR USUÁRIOS")
                print("1. Cadastrar novo usuário")
                print("2. Consultar usuário")
                print("0. Voltar")
                sub_choice = input("Escolha: ").strip()
                
                if sub_choice == "1":
                    print("\n➕ CADASTRAR NOVO USUÁRIO")
                    user_id = input("ID do usuário: ").strip()
                    name = input("Nome: ").strip()
                    email = input("Email: ").strip()
                    password = input("Senha: ").strip()
                    print("\nTipos de usuário:")
                    print("1. Administrador")
                    print("2. Bibliotecário")
                    print("3. Aluno")
                    role_choice = input("Tipo: ").strip()
                    
                    role_map = {
                        "1": UserRole.ADMIN,
                        "2": UserRole.LIBRARIAN,
                        "3": UserRole.STUDENT
                    }
                    
                    role = role_map.get(role_choice)
                    if role:
                        try:
                            new_user = system.register_user(user_id, name, email, password, role)
                            print(f"\n✅ Usuário {new_user.name} cadastrado com sucesso!")
                        except Exception as e:
                            print(f"\n❌ Erro: {e}")
                    else:
                        print("\n❌ Tipo de usuário inválido!")
                
                elif sub_choice == "2":
                    user_id = input("\nID do usuário: ").strip()
                    try:
                        user_info = system.get_user_info(user_id)
                        print("\n📋 DADOS DO USUÁRIO")
                        print_separator()
                        print(f"ID: {user_info['user_id']}")
                        print(f"Nome: {user_info['name']}")
                        print(f"Email: {user_info['email']}")
                        print(f"Tipo: {user_info['role']}")
                        print(f"Cadastrado em: {user_info['created_at']}")
                    except Exception as e:
                        print(f"\n❌ Erro: {e}")
            
            elif choice == "2":
                # Gerenciar livros
                print("\n📖 GERENCIAR LIVROS")
                print("1. Adicionar novo livro")
                print("2. Listar todos os livros")
                print("3. Listar livros disponíveis")
                print("4. Consultar livro")
                print("0. Voltar")
                sub_choice = input("Escolha: ").strip()
                
                if sub_choice == "1":
                    print("\n➕ ADICIONAR NOVO LIVRO")
                    book_id = input("ID do livro: ").strip()
                    title = input("Título: ").strip()
                    author = input("Autor: ").strip()
                    isbn = input("ISBN: ").strip()
                    quantity = input("Quantidade: ").strip()
                    
                    try:
                        book = system.add_book(book_id, title, author, isbn, int(quantity))
                        print(f"\n✅ Livro '{book.title}' adicionado com sucesso!")
                    except Exception as e:
                        print(f"\n❌ Erro: {e}")
                
                elif sub_choice == "2":
                    books = system.list_books()
                    print("\n📚 TODOS OS LIVROS")
                    print_separator()
                    
                    if not books:
                        print("Nenhum livro cadastrado.")
                    else:
                        for book in books:
                            print(f"\nID: {book.book_id}")
                            print(f"Título: {book.title}")
                            print(f"Autor: {book.author}")
                            print(f"ISBN: {book.isbn}")
                            print(f"Quantidade total: {book.quantity}")
                            print(f"Disponíveis: {book.available}")
                            print("-" * 40)
                
                elif sub_choice == "3":
                    books = system.list_available_books()
                    print("\n📚 LIVROS DISPONÍVEIS")
                    print_separator()
                    
                    if not books:
                        print("Nenhum livro disponível no momento.")
                    else:
                        for book in books:
                            print(f"\nID: {book.book_id}")
                            print(f"Título: {book.title}")
                            print(f"Autor: {book.author}")
                            print(f"Disponíveis: {book.available}")
                            print("-" * 40)
                
                elif sub_choice == "4":
                    book_id = input("\nID do livro: ").strip()
                    book = system.get_book(book_id)
                    
                    if book:
                        print("\n📖 INFORMAÇÕES DO LIVRO")
                        print_separator()
                        print(f"ID: {book.book_id}")
                        print(f"Título: {book.title}")
                        print(f"Autor: {book.author}")
                        print(f"ISBN: {book.isbn}")
                        print(f"Quantidade total: {book.quantity}")
                        print(f"Disponíveis: {book.available}")
                    else:
                        print("\n❌ Livro não encontrado!")
            
            elif choice == "3":
                # Gerenciar empréstimos
                print("\n📋 CRIAR EMPRÉSTIMO")
                loan_id = input("ID do empréstimo: ").strip()
                user_id = input("ID do aluno: ").strip()
                book_id = input("ID do livro: ").strip()
                
                try:
                    loan = system.create_loan(loan_id, user_id, book_id)
                    print(f"\n✅ Empréstimo criado com sucesso!")
                    print(f"Data do empréstimo: {loan.loan_date.strftime('%d/%m/%Y')}")
                    print(f"Data de devolução: {loan.due_date.strftime('%d/%m/%Y')}")
                except Exception as e:
                    print(f"\n❌ Erro: {e}")
            
            elif choice == "4":
                # Registrar devolução
                print("\n📤 REGISTRAR DEVOLUÇÃO")
                loan_id = input("ID do empréstimo: ").strip()
                
                try:
                    fine = system.return_book(loan_id)
                    print(f"\n✅ Devolução registrada com sucesso!")
                    
                    if fine > 0:
                        print(f"⚠️  Multa aplicada: R$ {fine:.2f}")
                        print("O aluno deve pagar a multa.")
                    else:
                        print("✅ Sem multa - livro devolvido no prazo!")
                except Exception as e:
                    print(f"\n❌ Erro: {e}")
            
            elif choice == "5":
                # Registrar pagamento de multa
                print("\n💰 REGISTRAR PAGAMENTO DE MULTA")
                payment_id = input("ID do pagamento: ").strip()
                loan_id = input("ID do empréstimo: ").strip()
                amount = input("Valor pago: R$ ").strip()
                
                try:
                    payment = system.pay_fine(payment_id, loan_id, float(amount))
                    print(f"\n✅ Pagamento registrado com sucesso!")
                    print(f"Valor: R$ {payment.amount:.2f}")
                    print(f"Data: {payment.payment_date.strftime('%d/%m/%Y %H:%M')}")
                except Exception as e:
                    print(f"\n❌ Erro: {e}")
            
            elif choice == "6":
                # Relatórios
                print("\n📊 RELATÓRIOS")
                print("1. Livros emprestados por aluno (6.1)")
                print("2. Livros em atraso (6.2)")
                print("0. Voltar")
                sub_choice = input("Escolha: ").strip()
                
                if sub_choice == "1":
                    user_id = input("\nID do aluno: ").strip()
                    try:
                        loans = system.report_books_by_student(user_id)
                        print(f"\n📚 EMPRÉSTIMOS DO ALUNO {user_id}")
                        print_separator()
                        
                        if not loans:
                            print("Nenhum empréstimo encontrado para este aluno.")
                        else:
                            for loan in loans:
                                print(f"\nID do empréstimo: {loan['loan_id']}")
                                print(f"Livro: {loan.get('book_title', 'N/A')}")
                                print(f"Autor: {loan.get('book_author', 'N/A')}")
                                print(f"Data do empréstimo: {loan['loan_date']}")
                                print(f"Data prevista de devolução: {loan['due_date']}")
                                if loan['return_date']:
                                    print(f"Devolvido em: {loan['return_date']}")
                                else:
                                    print("Status: Pendente")
                                if loan['is_overdue']:
                                    print("⚠️  ATRASADO!")
                                if loan['fine_amount'] > 0:
                                    status = "Paga" if loan['fine_paid'] else "Pendente"
                                    print(f"Multa: R$ {loan['fine_amount']:.2f} ({status})")
                                print("-" * 40)
                    except Exception as e:
                        print(f"\n❌ Erro: {e}")
                
                elif sub_choice == "2":
                    try:
                        overdue_loans = system.report_overdue_books()
                        print("\n⚠️  LIVROS EM ATRASO")
                        print_separator()
                        
                        if not overdue_loans:
                            print("✅ Nenhum livro em atraso!")
                        else:
                            for loan in overdue_loans:
                                print(f"\nID do empréstimo: {loan['loan_id']}")
                                print(f"Aluno: {loan.get('student_name', 'N/A')}")
                                print(f"Livro: {loan.get('book_title', 'N/A')}")
                                print(f"Data prevista de devolução: {loan['due_date']}")
                                print(f"Dias de atraso: {loan['days_overdue']}")
                                print(f"Multa atual: R$ {loan['current_fine']:.2f}")
                                status = "Paga" if loan['fine_paid'] else "Pendente"
                                print(f"Status da multa: {status}")
                                print("-" * 40)
                    except Exception as e:
                        print(f"\n❌ Erro: {e}")


if __name__ == "__main__":
    main()
