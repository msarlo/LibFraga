"""
Sistema de Biblioteca - LibFraga
Sistema para gerenciamento de biblioteca com suporte para:
- Usuários (Administrador, Bibliotecário, Aluno)
- Livros
- Empréstimos
- Devoluções com multas
- Pagamentos de multas
- Relatórios
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict
from enum import Enum
import json


class UserRole(Enum):
    """Tipos de usuário no sistema"""
    ADMIN = "admin"
    LIBRARIAN = "bibliotecario"
    STUDENT = "aluno"


class User:
    """Classe para representar um usuário do sistema"""
    
    def __init__(self, user_id: str, name: str, email: str, password: str, role: UserRole):
        self.user_id = user_id
        self.name = name
        self.email = email
        self.password = password  # Em produção, deve ser hasheado
        self.role = role
        self.created_at = datetime.now()
    
    def can_register_users(self) -> bool:
        """Apenas administradores podem cadastrar outros usuários"""
        return self.role == UserRole.ADMIN
    
    def can_manage_books(self) -> bool:
        """Administradores e bibliotecários podem gerenciar livros"""
        return self.role in [UserRole.ADMIN, UserRole.LIBRARIAN]
    
    def can_manage_loans(self) -> bool:
        """Administradores e bibliotecários podem gerenciar empréstimos"""
        return self.role in [UserRole.ADMIN, UserRole.LIBRARIAN]
    
    def to_dict(self) -> Dict:
        """Converte usuário para dicionário"""
        return {
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'role': self.role.value,
            'created_at': self.created_at.isoformat()
        }


class Book:
    """Classe para representar um livro na biblioteca"""
    
    def __init__(self, book_id: str, title: str, author: str, isbn: str, quantity: int):
        self.book_id = book_id
        self.title = title
        self.author = author
        self.isbn = isbn
        self.quantity = quantity
        self.available = quantity
        self.created_at = datetime.now()
    
    def is_available(self) -> bool:
        """Verifica se há exemplares disponíveis"""
        return self.available > 0
    
    def borrow(self) -> bool:
        """Empresta um exemplar do livro"""
        if self.is_available():
            self.available -= 1
            return True
        return False
    
    def return_copy(self):
        """Devolve um exemplar do livro"""
        if self.available < self.quantity:
            self.available += 1
    
    def to_dict(self) -> Dict:
        """Converte livro para dicionário"""
        return {
            'book_id': self.book_id,
            'title': self.title,
            'author': self.author,
            'isbn': self.isbn,
            'quantity': self.quantity,
            'available': self.available,
            'created_at': self.created_at.isoformat()
        }


class Loan:
    """Classe para representar um empréstimo de livro"""
    
    LOAN_PERIOD_DAYS = 14  # Período padrão de empréstimo: 14 dias
    
    def __init__(self, loan_id: str, user_id: str, book_id: str, loan_date: Optional[datetime] = None):
        self.loan_id = loan_id
        self.user_id = user_id
        self.book_id = book_id
        self.loan_date = loan_date or datetime.now()
        self.due_date = self.loan_date + timedelta(days=self.LOAN_PERIOD_DAYS)
        self.return_date: Optional[datetime] = None
        self.fine_amount: float = 0.0
        self.fine_paid: bool = False
    
    def is_overdue(self) -> bool:
        """Verifica se o empréstimo está em atraso"""
        if self.return_date:
            return False
        return datetime.now() > self.due_date
    
    def days_overdue(self) -> int:
        """Calcula quantos dias de atraso"""
        if not self.is_overdue():
            return 0
        return (datetime.now() - self.due_date).days
    
    def calculate_fine(self, daily_rate: float = 1.0) -> float:
        """Calcula multa por atraso (R$ 1,00 por dia como padrão)"""
        if not self.is_overdue():
            return 0.0
        return self.days_overdue() * daily_rate
    
    def return_book(self, return_date: Optional[datetime] = None) -> float:
        """Registra devolução do livro e calcula multa se houver"""
        self.return_date = return_date or datetime.now()
        if self.return_date > self.due_date:
            days_late = (self.return_date - self.due_date).days
            self.fine_amount = days_late * 1.0  # R$ 1,00 por dia
        return self.fine_amount
    
    def to_dict(self) -> Dict:
        """Converte empréstimo para dicionário"""
        return {
            'loan_id': self.loan_id,
            'user_id': self.user_id,
            'book_id': self.book_id,
            'loan_date': self.loan_date.isoformat(),
            'due_date': self.due_date.isoformat(),
            'return_date': self.return_date.isoformat() if self.return_date else None,
            'fine_amount': self.fine_amount,
            'fine_paid': self.fine_paid,
            'is_overdue': self.is_overdue()
        }


class Payment:
    """Classe para representar um pagamento de multa"""
    
    def __init__(self, payment_id: str, loan_id: str, amount: float, payment_date: Optional[datetime] = None):
        self.payment_id = payment_id
        self.loan_id = loan_id
        self.amount = amount
        self.payment_date = payment_date or datetime.now()
    
    def to_dict(self) -> Dict:
        """Converte pagamento para dicionário"""
        return {
            'payment_id': self.payment_id,
            'loan_id': self.loan_id,
            'amount': self.amount,
            'payment_date': self.payment_date.isoformat()
        }


class LibrarySystem:
    """Sistema principal da biblioteca"""
    
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.books: Dict[str, Book] = {}
        self.loans: Dict[str, Loan] = {}
        self.payments: Dict[str, Payment] = {}
        self.current_user: Optional[User] = None
        
        # Criar usuário administrador padrão
        self._create_default_admin()
    
    def _create_default_admin(self):
        """Cria um usuário administrador padrão"""
        admin = User("admin001", "Administrador", "admin@libfraga.com", "admin123", UserRole.ADMIN)
        self.users[admin.user_id] = admin
    
    # Autenticação
    def login(self, email: str, password: str) -> Optional[User]:
        """Realiza login no sistema"""
        for user in self.users.values():
            if user.email == email and user.password == password:
                self.current_user = user
                return user
        return None
    
    def logout(self):
        """Realiza logout do sistema"""
        self.current_user = None
    
    # Gerenciamento de Usuários
    def register_user(self, user_id: str, name: str, email: str, password: str, role: UserRole) -> Optional[User]:
        """Registra um novo usuário (apenas administradores)"""
        if not self.current_user or not self.current_user.can_register_users():
            raise PermissionError("Apenas administradores podem cadastrar usuários")
        
        if user_id in self.users:
            raise ValueError(f"Usuário com ID {user_id} já existe")
        
        user = User(user_id, name, email, password, role)
        self.users[user_id] = user
        return user
    
    def get_user(self, user_id: str) -> Optional[User]:
        """Obtém informações de um usuário"""
        # Alunos só podem ver seus próprios dados
        if self.current_user and self.current_user.role == UserRole.STUDENT:
            if user_id != self.current_user.user_id:
                raise PermissionError("Alunos só podem consultar seus próprios dados")
        
        return self.users.get(user_id)
    
    # Gerenciamento de Livros
    def add_book(self, book_id: str, title: str, author: str, isbn: str, quantity: int) -> Book:
        """Adiciona um novo livro (administradores e bibliotecários)"""
        if not self.current_user or not self.current_user.can_manage_books():
            raise PermissionError("Apenas administradores e bibliotecários podem gerenciar livros")
        
        if book_id in self.books:
            raise ValueError(f"Livro com ID {book_id} já existe")
        
        book = Book(book_id, title, author, isbn, quantity)
        self.books[book_id] = book
        return book
    
    def get_book(self, book_id: str) -> Optional[Book]:
        """Obtém informações de um livro"""
        return self.books.get(book_id)
    
    def list_books(self) -> List[Book]:
        """Lista todos os livros"""
        return list(self.books.values())
    
    def list_available_books(self) -> List[Book]:
        """Lista livros disponíveis"""
        return [book for book in self.books.values() if book.is_available()]
    
    # Gerenciamento de Empréstimos
    def create_loan(self, loan_id: str, user_id: str, book_id: str) -> Loan:
        """Cria um novo empréstimo (administradores e bibliotecários)"""
        if not self.current_user or not self.current_user.can_manage_loans():
            raise PermissionError("Apenas administradores e bibliotecários podem criar empréstimos")
        
        if user_id not in self.users:
            raise ValueError(f"Usuário {user_id} não encontrado")
        
        if book_id not in self.books:
            raise ValueError(f"Livro {book_id} não encontrado")
        
        book = self.books[book_id]
        if not book.borrow():
            raise ValueError(f"Livro {book_id} não disponível")
        
        loan = Loan(loan_id, user_id, book_id)
        self.loans[loan_id] = loan
        return loan
    
    def return_book(self, loan_id: str) -> float:
        """Registra devolução de livro (administradores e bibliotecários)"""
        if not self.current_user or not self.current_user.can_manage_loans():
            raise PermissionError("Apenas administradores e bibliotecários podem registrar devoluções")
        
        if loan_id not in self.loans:
            raise ValueError(f"Empréstimo {loan_id} não encontrado")
        
        loan = self.loans[loan_id]
        if loan.return_date:
            raise ValueError(f"Livro já foi devolvido")
        
        fine = loan.return_book()
        
        # Devolver exemplar ao estoque
        if loan.book_id in self.books:
            self.books[loan.book_id].return_copy()
        
        return fine
    
    # Gerenciamento de Pagamentos
    def pay_fine(self, payment_id: str, loan_id: str, amount: float) -> Payment:
        """Registra pagamento de multa (administradores e bibliotecários)"""
        if not self.current_user or not self.current_user.can_manage_loans():
            raise PermissionError("Apenas administradores e bibliotecários podem registrar pagamentos")
        
        if loan_id not in self.loans:
            raise ValueError(f"Empréstimo {loan_id} não encontrado")
        
        loan = self.loans[loan_id]
        if amount < loan.fine_amount:
            raise ValueError(f"Valor insuficiente. Multa: R$ {loan.fine_amount:.2f}")
        
        payment = Payment(payment_id, loan_id, amount)
        self.payments[payment_id] = payment
        loan.fine_paid = True
        
        return payment
    
    # Relatórios
    def report_books_by_student(self, user_id: str) -> List[Dict]:
        """
        Relatório 6.1: Livros emprestados por aluno
        Alunos só podem consultar seus próprios empréstimos
        """
        if self.current_user:
            # Alunos só podem ver seus próprios empréstimos
            if self.current_user.role == UserRole.STUDENT and user_id != self.current_user.user_id:
                raise PermissionError("Alunos só podem consultar seus próprios empréstimos")
        
        student_loans = []
        for loan in self.loans.values():
            if loan.user_id == user_id:
                loan_info = loan.to_dict()
                if loan.book_id in self.books:
                    loan_info['book_title'] = self.books[loan.book_id].title
                    loan_info['book_author'] = self.books[loan.book_id].author
                student_loans.append(loan_info)
        
        return student_loans
    
    def report_overdue_books(self) -> List[Dict]:
        """
        Relatório 6.2: Livros em atraso
        Apenas administradores e bibliotecários podem consultar
        """
        if not self.current_user or not self.current_user.can_manage_loans():
            raise PermissionError("Apenas administradores e bibliotecários podem consultar livros em atraso")
        
        overdue_loans = []
        for loan in self.loans.values():
            if loan.is_overdue():
                loan_info = loan.to_dict()
                loan_info['days_overdue'] = loan.days_overdue()
                loan_info['current_fine'] = loan.calculate_fine()
                
                if loan.user_id in self.users:
                    loan_info['student_name'] = self.users[loan.user_id].name
                
                if loan.book_id in self.books:
                    loan_info['book_title'] = self.books[loan.book_id].title
                
                overdue_loans.append(loan_info)
        
        return overdue_loans
    
    def get_user_info(self, user_id: str) -> Dict:
        """Obtém informações do usuário (alunos só podem ver seus próprios dados)"""
        if self.current_user:
            if self.current_user.role == UserRole.STUDENT and user_id != self.current_user.user_id:
                raise PermissionError("Alunos só podem consultar seus próprios dados")
        
        user = self.get_user(user_id)
        if not user:
            raise ValueError(f"Usuário {user_id} não encontrado")
        
        return user.to_dict()
