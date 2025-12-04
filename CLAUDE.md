# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LibFraga is a library management system built with Next.js 14, TypeScript, Prisma ORM with SQLite, and NextAuth.js for authentication. The system manages users (ADMIN, BIBLIOTECARIO, ALUNO), books, loans, fines, and provides reporting capabilities.

## Development Commands

```bash
npm run dev              # Start development server on http://localhost:3000
npm run build            # Build for production
npm start                # Start production server
```

### Database Operations

```bash
npm run db:generate      # Generate Prisma Client after schema changes
npm run db:migrate       # Create and apply database migrations
npm run db:push          # Push schema without migration
npm run db:studio        # Open Prisma Studio (visual database editor)
npm run db:seed          # Run seed script (creates test users)
npm run db:reset         # Reset database with confirmation
npm run db:reset:force   # Force reset + seed (no confirmation)
npm run db:setup         # Full setup: generate + push + seed
```

### Test Users (after seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@teste.com | 123456 | ADMIN |
| bibliotecario@teste.com | 123456 | BIBLIOTECARIO |
| aluno@teste.com | 123456 | ALUNO |

## Architecture

### Authentication (NextAuth.js)

- Uses `CredentialsProvider` with bcrypt password hashing
- JWT strategy for sessions
- Custom login page at `/login`
- Session includes `user.id` and `user.role`
- Type extensions in `src/types/next-auth.d.ts`

### Middleware Protection

Protected routes defined in `src/middleware.ts`:
- `/api/users/*`, `/api/books/*`, `/api/loans/*`, `/api/fines/*`, `/api/reports/*`
- `/users/*`, `/books/*`

### Prisma Configuration

The Prisma Client is generated to `src/generated/prisma`. Always import from:
```typescript
import { PrismaClient } from '@/generated/prisma'
```

Use the singleton instance:
```typescript
import { prisma } from '@/lib/prisma'
```

**Important**: The `prisma.ts` singleton uses `path.resolve(process.cwd(), 'prisma', 'dev.db')` for the database path to avoid relative path issues with the generated client.

### Database Schema

**Models:**
- **User**: Roles are ADMIN, BIBLIOTECARIO, or ALUNO (default)
- **Book**: Tracks `quantity` and `available` count
- **Loan**: Status can be ACTIVE, RETURNED, or OVERDUE
- **Fine**: One-to-one with Loan, tracks payment status

### API Routes Structure

```
src/app/api/
├── auth/
│   ├── [...nextauth]/route.ts  # NextAuth handler
│   ├── login/route.ts          # Legacy login endpoint
│   ├── register/route.ts
│   └── me/route.ts
├── books/
├── users/
├── loans/
├── fines/
└── reports/
    ├── loans-by-student/
    ├── overdue-books/
    └── popular-books/
```

### Business Rules

1. **User Management**: Only ADMIN can create new users
2. **Loan System**: Decrement `Book.available` on loan creation; increment on return
3. **Overdue Detection**: Loans with `returnDate = null` and `dueDate < now()` are OVERDUE
4. **Fines**: Auto-generated for overdue loans

### Environment Variables

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Important Notes

- Passwords are hashed with bcrypt (10 rounds)
- SQLite database at `prisma/dev.db` (gitignored)
- TypeScript path alias `@/*` maps to `src/*`
- Prisma Client output is customized to `src/generated/prisma`
