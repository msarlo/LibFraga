# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LibFraga is a library management system built with Next.js 14, TypeScript, and Prisma ORM with SQLite. The system manages users (Admin, Bibliotecário, Aluno), books, loans, fines, and provides reporting capabilities.

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm start            # Start production server
```

### Database Operations
```bash
npm run prisma:generate  # Generate Prisma Client after schema changes
npm run prisma:migrate   # Create and apply database migrations
npm run prisma:studio    # Open Prisma Studio (visual database editor)
```

### Direct Prisma Commands
```bash
npx prisma migrate dev --name <migration_name>  # Create named migration
npx prisma db push                              # Push schema without migration
npx prisma generate                             # Regenerate Prisma Client
```

## Architecture

### Database Schema (Prisma + SQLite)

**Key Models:**
- **User**: Roles are ADMIN, BIBLIOTECARIO, or ALUNO. Only admins can create users. Bibliotecários and admins have full access; alunos can only view their own loans and profile.
- **Book**: Tracks both total `quantity` and `available` count
- **Loan**: Status can be ACTIVE, RETURNED, or OVERDUE. Links to both User and Book
- **Fine**: One-to-one relationship with Loan. Tracks payment status

**Important Relationships:**
- Each Loan can have at most one Fine (1:1)
- Users and Books have many Loans (1:N)
- Fines reference both Loan and User

### Prisma Client Location

The Prisma Client is generated to `src/generated/prisma` (not the default location). Always import from:
```typescript
import { PrismaClient } from '@/generated/prisma'
```

Use the singleton instance from `src/lib/prisma.ts`:
```typescript
import { prisma } from '@/lib/prisma'
```

### Type System

- Prisma types are re-exported from `src/types/index.ts`
- DTOs (Data Transfer Objects) for API operations are defined in `src/types/index.ts`
- Use `CreateUserDTO`, `CreateBookDTO`, `CreateLoanDTO` for input validation

### Application Structure

```
src/
├── app/              # Next.js 14 App Router pages
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── components/       # Reusable React components
├── lib/              # Utility functions and configurations
│   └── prisma.ts     # Prisma Client singleton
├── types/            # TypeScript types and DTOs
└── generated/        # Auto-generated Prisma Client (gitignored)
    └── prisma/
```

### Business Rules

1. **User Management**: Only ADMIN role can create new users
2. **Loan System**: When a loan is created, decrement Book.available; when returned, increment it
3. **Overdue Detection**: Loans with `returnDate = null` and `dueDate < now()` should have status OVERDUE
4. **Fines**: Generated automatically for overdue loans. Track payment separately
5. **Reports**:
   - Loans per student: Filter by userId
   - Overdue books: Filter by status = OVERDUE

### Environment Variables

Database connection is configured in `.env`:
```
DATABASE_URL="file:./dev.db"
```

The database file is located at `prisma/dev.db` (gitignored).

## Important Notes

- This project uses Prisma v7, which moved datasource URLs from schema to `prisma.config.ts`
- The database uses SQLite, so UUID support requires the `@default(uuid())` attribute
- Prisma Client output directory is customized to `src/generated/prisma`
- TypeScript path alias `@/*` maps to `src/*`
