// Re-export Prisma types
export type { User, Book, Loan, Fine, UserRole, LoanStatus } from '@/generated/prisma'

// Additional custom types can be added here
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'BIBLIOTECARIO' | 'ALUNO';
}

export interface CreateBookDTO {
  title: string;
  author: string;
  isbn: string;
  quantity?: number;
}

export interface CreateLoanDTO {
  bookId: string;
  userId: string;
  dueDate: Date;
}

export interface LoanWithDetails {
  id: string;
  book: {
    title: string;
    author: string;
  };
  user: {
    name: string;
    email: string;
  };
  loanDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: string;
  fine?: {
    amount: number;
    paid: boolean;
  };
}
