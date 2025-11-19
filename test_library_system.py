"""
Testes para o Sistema de Biblioteca LibFraga
"""

import unittest
from datetime import datetime, timedelta
from library_system import (
    LibrarySystem, User, Book, Loan, Payment, UserRole
)


class TestUser(unittest.TestCase):
    """Testes para a classe User"""
    
    def test_create_user(self):
        """Testa criação de usuário"""
        user = User("u001", "João Silva", "joao@email.com", "senha123", UserRole.STUDENT)
        self.assertEqual(user.user_id, "u001")
        self.assertEqual(user.name, "João Silva")
        self.assertEqual(user.role, UserRole.STUDENT)
    
    def test_admin_can_register_users(self):
        """Testa que apenas admin pode registrar usuários"""
        admin = User("a001", "Admin", "admin@email.com", "pass", UserRole.ADMIN)
        librarian = User("l001", "Lib", "lib@email.com", "pass", UserRole.LIBRARIAN)
        student = User("s001", "Student", "stu@email.com", "pass", UserRole.STUDENT)
        
        self.assertTrue(admin.can_register_users())
        self.assertFalse(librarian.can_register_users())
        self.assertFalse(student.can_register_users())
    
    def test_admin_and_librarian_can_manage_books(self):
        """Testa que admin e bibliotecário podem gerenciar livros"""
        admin = User("a001", "Admin", "admin@email.com", "pass", UserRole.ADMIN)
        librarian = User("l001", "Lib", "lib@email.com", "pass", UserRole.LIBRARIAN)
        student = User("s001", "Student", "stu@email.com", "pass", UserRole.STUDENT)
        
        self.assertTrue(admin.can_manage_books())
        self.assertTrue(librarian.can_manage_books())
        self.assertFalse(student.can_manage_books())
    
    def test_admin_and_librarian_can_manage_loans(self):
        """Testa que admin e bibliotecário podem gerenciar empréstimos"""
        admin = User("a001", "Admin", "admin@email.com", "pass", UserRole.ADMIN)
        librarian = User("l001", "Lib", "lib@email.com", "pass", UserRole.LIBRARIAN)
        student = User("s001", "Student", "stu@email.com", "pass", UserRole.STUDENT)
        
        self.assertTrue(admin.can_manage_loans())
        self.assertTrue(librarian.can_manage_loans())
        self.assertFalse(student.can_manage_loans())


class TestBook(unittest.TestCase):
    """Testes para a classe Book"""
    
    def test_create_book(self):
        """Testa criação de livro"""
        book = Book("b001", "Clean Code", "Robert Martin", "1234567890", 5)
        self.assertEqual(book.book_id, "b001")
        self.assertEqual(book.title, "Clean Code")
        self.assertEqual(book.quantity, 5)
        self.assertEqual(book.available, 5)
    
    def test_book_is_available(self):
        """Testa verificação de disponibilidade"""
        book = Book("b001", "Clean Code", "Robert Martin", "1234567890", 1)
        self.assertTrue(book.is_available())
        
        book.borrow()
        self.assertFalse(book.is_available())
    
    def test_borrow_book(self):
        """Testa empréstimo de livro"""
        book = Book("b001", "Clean Code", "Robert Martin", "1234567890", 2)
        
        self.assertTrue(book.borrow())
        self.assertEqual(book.available, 1)
        
        self.assertTrue(book.borrow())
        self.assertEqual(book.available, 0)
        
        self.assertFalse(book.borrow())  # Não deve permitir mais empréstimos
    
    def test_return_book(self):
        """Testa devolução de livro"""
        book = Book("b001", "Clean Code", "Robert Martin", "1234567890", 2)
        book.borrow()
        self.assertEqual(book.available, 1)
        
        book.return_copy()
        self.assertEqual(book.available, 2)


class TestLoan(unittest.TestCase):
    """Testes para a classe Loan"""
    
    def test_create_loan(self):
        """Testa criação de empréstimo"""
        loan = Loan("l001", "u001", "b001")
        self.assertEqual(loan.loan_id, "l001")
        self.assertEqual(loan.user_id, "u001")
        self.assertEqual(loan.book_id, "b001")
        self.assertIsNone(loan.return_date)
    
    def test_loan_due_date(self):
        """Testa data de devolução do empréstimo"""
        loan_date = datetime.now()
        loan = Loan("l001", "u001", "b001", loan_date)
        
        expected_due = loan_date + timedelta(days=14)
        self.assertEqual(loan.due_date.date(), expected_due.date())
    
    def test_loan_not_overdue_within_period(self):
        """Testa que empréstimo não está atrasado dentro do prazo"""
        loan = Loan("l001", "u001", "b001")
        self.assertFalse(loan.is_overdue())
    
    def test_loan_overdue_after_period(self):
        """Testa que empréstimo está atrasado após o prazo"""
        past_date = datetime.now() - timedelta(days=20)
        loan = Loan("l001", "u001", "b001", past_date)
        self.assertTrue(loan.is_overdue())
    
    def test_calculate_fine_no_delay(self):
        """Testa que não há multa quando devolvido no prazo"""
        loan = Loan("l001", "u001", "b001")
        fine = loan.return_book()
        self.assertEqual(fine, 0.0)
    
    def test_calculate_fine_with_delay(self):
        """Testa cálculo de multa com atraso"""
        past_date = datetime.now() - timedelta(days=20)  # 6 dias de atraso
        loan = Loan("l001", "u001", "b001", past_date)
        
        fine = loan.return_book()
        self.assertEqual(fine, 6.0)  # R$ 1,00 por dia
    
    def test_days_overdue(self):
        """Testa cálculo de dias em atraso"""
        past_date = datetime.now() - timedelta(days=20)
        loan = Loan("l001", "u001", "b001", past_date)
        
        self.assertEqual(loan.days_overdue(), 6)


class TestLibrarySystem(unittest.TestCase):
    """Testes para o sistema completo"""
    
    def setUp(self):
        """Configuração inicial para cada teste"""
        self.system = LibrarySystem()
        # Login como admin
        self.admin = self.system.login("admin@libfraga.com", "admin123")
    
    def test_default_admin_exists(self):
        """Testa que administrador padrão é criado"""
        self.assertIsNotNone(self.admin)
        self.assertEqual(self.admin.role, UserRole.ADMIN)
    
    def test_login_with_valid_credentials(self):
        """Testa login com credenciais válidas"""
        user = self.system.login("admin@libfraga.com", "admin123")
        self.assertIsNotNone(user)
        self.assertEqual(user.email, "admin@libfraga.com")
    
    def test_login_with_invalid_credentials(self):
        """Testa login com credenciais inválidas"""
        user = self.system.login("wrong@email.com", "wrongpass")
        self.assertIsNone(user)
    
    def test_admin_can_register_user(self):
        """Testa que admin pode cadastrar usuário"""
        new_user = self.system.register_user(
            "u001", "João Silva", "joao@email.com", "senha123", UserRole.STUDENT
        )
        
        self.assertIsNotNone(new_user)
        self.assertEqual(new_user.user_id, "u001")
        self.assertTrue("u001" in self.system.users)
    
    def test_student_cannot_register_user(self):
        """Testa que aluno não pode cadastrar usuário"""
        # Criar e fazer login como aluno
        self.system.register_user("s001", "Aluno", "aluno@email.com", "pass", UserRole.STUDENT)
        self.system.logout()
        self.system.login("aluno@email.com", "pass")
        
        with self.assertRaises(PermissionError):
            self.system.register_user("u002", "Outro", "outro@email.com", "pass", UserRole.STUDENT)
    
    def test_admin_can_add_book(self):
        """Testa que admin pode adicionar livro"""
        book = self.system.add_book("b001", "Clean Code", "Robert Martin", "1234567890", 5)
        
        self.assertIsNotNone(book)
        self.assertEqual(book.book_id, "b001")
        self.assertTrue("b001" in self.system.books)
    
    def test_librarian_can_add_book(self):
        """Testa que bibliotecário pode adicionar livro"""
        # Criar e fazer login como bibliotecário
        self.system.register_user("l001", "Bibliotecário", "lib@email.com", "pass", UserRole.LIBRARIAN)
        self.system.logout()
        self.system.login("lib@email.com", "pass")
        
        book = self.system.add_book("b001", "Clean Code", "Robert Martin", "1234567890", 5)
        self.assertIsNotNone(book)
    
    def test_student_cannot_add_book(self):
        """Testa que aluno não pode adicionar livro"""
        self.system.register_user("s001", "Aluno", "aluno@email.com", "pass", UserRole.STUDENT)
        self.system.logout()
        self.system.login("aluno@email.com", "pass")
        
        with self.assertRaises(PermissionError):
            self.system.add_book("b001", "Clean Code", "Robert Martin", "1234567890", 5)
    
    def test_create_loan(self):
        """Testa criação de empréstimo"""
        # Criar usuário e livro
        self.system.register_user("s001", "Aluno", "aluno@email.com", "pass", UserRole.STUDENT)
        self.system.add_book("b001", "Clean Code", "Robert Martin", "1234567890", 5)
        
        # Criar empréstimo
        loan = self.system.create_loan("loan001", "s001", "b001")
        
        self.assertIsNotNone(loan)
        self.assertEqual(loan.loan_id, "loan001")
        self.assertEqual(self.system.books["b001"].available, 4)
    
    def test_cannot_loan_unavailable_book(self):
        """Testa que não pode emprestar livro indisponível"""
        self.system.register_user("s001", "Aluno", "aluno@email.com", "pass", UserRole.STUDENT)
        self.system.add_book("b001", "Clean Code", "Robert Martin", "1234567890", 1)
        
        # Primeiro empréstimo bem-sucedido
        self.system.create_loan("loan001", "s001", "b001")
        
        # Segundo empréstimo deve falhar
        with self.assertRaises(ValueError):
            self.system.create_loan("loan002", "s001", "b001")
    
    def test_return_book_no_fine(self):
        """Testa devolução sem multa"""
        self.system.register_user("s001", "Aluno", "aluno@email.com", "pass", UserRole.STUDENT)
        self.system.add_book("b001", "Clean Code", "Robert Martin", "1234567890", 5)
        self.system.create_loan("loan001", "s001", "b001")
        
        fine = self.system.return_book("loan001")
        
        self.assertEqual(fine, 0.0)
        self.assertEqual(self.system.books["b001"].available, 5)
    
    def test_return_book_with_fine(self):
        """Testa devolução com multa"""
        self.system.register_user("s001", "Aluno", "aluno@email.com", "pass", UserRole.STUDENT)
        self.system.add_book("b001", "Clean Code", "Robert Martin", "1234567890", 5)
        
        # Criar empréstimo com data no passado
        past_date = datetime.now() - timedelta(days=20)
        loan = Loan("loan001", "s001", "b001", past_date)
        self.system.loans["loan001"] = loan
        self.system.books["b001"].available = 4
        
        fine = self.system.return_book("loan001")
        
        self.assertEqual(fine, 6.0)  # 6 dias de atraso
    
    def test_pay_fine(self):
        """Testa pagamento de multa"""
        self.system.register_user("s001", "Aluno", "aluno@email.com", "pass", UserRole.STUDENT)
        self.system.add_book("b001", "Clean Code", "Robert Martin", "1234567890", 5)
        
        # Criar empréstimo atrasado
        past_date = datetime.now() - timedelta(days=20)
        loan = Loan("loan001", "s001", "b001", past_date)
        self.system.loans["loan001"] = loan
        self.system.books["b001"].available = 4
        
        # Devolver e gerar multa
        self.system.return_book("loan001")
        
        # Pagar multa
        payment = self.system.pay_fine("pay001", "loan001", 6.0)
        
        self.assertIsNotNone(payment)
        self.assertTrue(self.system.loans["loan001"].fine_paid)
    
    def test_student_can_see_own_loans(self):
        """Testa que aluno pode ver seus próprios empréstimos"""
        # Criar e fazer empréstimo para aluno
        self.system.register_user("s001", "Aluno", "aluno@email.com", "pass", UserRole.STUDENT)
        self.system.add_book("b001", "Clean Code", "Robert Martin", "1234567890", 5)
        self.system.create_loan("loan001", "s001", "b001")
        
        # Fazer login como aluno
        self.system.logout()
        self.system.login("aluno@email.com", "pass")
        
        # Aluno deve poder ver seus empréstimos
        loans = self.system.report_books_by_student("s001")
        self.assertEqual(len(loans), 1)
    
    def test_student_cannot_see_others_loans(self):
        """Testa que aluno não pode ver empréstimos de outros"""
        # Criar dois alunos
        self.system.register_user("s001", "Aluno 1", "aluno1@email.com", "pass", UserRole.STUDENT)
        self.system.register_user("s002", "Aluno 2", "aluno2@email.com", "pass", UserRole.STUDENT)
        
        # Fazer login como aluno 1
        self.system.logout()
        self.system.login("aluno1@email.com", "pass")
        
        # Aluno 1 não deve poder ver empréstimos do aluno 2
        with self.assertRaises(PermissionError):
            self.system.report_books_by_student("s002")
    
    def test_student_can_see_own_data(self):
        """Testa que aluno pode ver seus próprios dados"""
        self.system.register_user("s001", "Aluno", "aluno@email.com", "pass", UserRole.STUDENT)
        self.system.logout()
        self.system.login("aluno@email.com", "pass")
        
        user_info = self.system.get_user_info("s001")
        self.assertEqual(user_info['user_id'], "s001")
    
    def test_student_cannot_see_others_data(self):
        """Testa que aluno não pode ver dados de outros"""
        self.system.register_user("s001", "Aluno 1", "aluno1@email.com", "pass", UserRole.STUDENT)
        self.system.register_user("s002", "Aluno 2", "aluno2@email.com", "pass", UserRole.STUDENT)
        self.system.logout()
        self.system.login("aluno1@email.com", "pass")
        
        with self.assertRaises(PermissionError):
            self.system.get_user_info("s002")
    
    def test_report_overdue_books(self):
        """Testa relatório de livros em atraso"""
        self.system.register_user("s001", "Aluno", "aluno@email.com", "pass", UserRole.STUDENT)
        self.system.add_book("b001", "Clean Code", "Robert Martin", "1234567890", 5)
        
        # Criar empréstimo atrasado
        past_date = datetime.now() - timedelta(days=20)
        loan = Loan("loan001", "s001", "b001", past_date)
        self.system.loans["loan001"] = loan
        
        # Obter relatório
        overdue = self.system.report_overdue_books()
        
        self.assertEqual(len(overdue), 1)
        self.assertEqual(overdue[0]['loan_id'], "loan001")
        self.assertEqual(overdue[0]['days_overdue'], 6)
    
    def test_student_cannot_see_overdue_report(self):
        """Testa que aluno não pode ver relatório de atrasos"""
        self.system.register_user("s001", "Aluno", "aluno@email.com", "pass", UserRole.STUDENT)
        self.system.logout()
        self.system.login("aluno@email.com", "pass")
        
        with self.assertRaises(PermissionError):
            self.system.report_overdue_books()


if __name__ == "__main__":
    unittest.main()
