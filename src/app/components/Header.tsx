'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === 'ADMIN';
  const isLibrarian = session?.user?.role === 'BIBLIOTECARIO';
  const isStudent = session?.user?.role === 'ALUNO';

  if (pathname === '/login') {
    return null; 
  }

  return (
    <header className="header">
      <nav className="nav">
        <Link href="/" className="logo">
          LibFraga
        </Link>
        <div className="nav-links">
          {status === 'authenticated' && (
            <>
              <Link href="/">Home</Link>
              <Link href="/books">Livros</Link>
              
              {(isAdmin || isLibrarian) && (
                <>
                  <Link href="/users">Usuários</Link>
                  <Link href="/loans">Empréstimos</Link>
                  <Link href="/reports">Relatórios</Link>
                </>
              )}

              {isStudent && (
                 <Link href={`/users/${session.user.id}`}>Meus Empréstimos</Link>
              )}

            </>
          )}
        </div>
        <div className="nav-auth">
            {status === 'authenticated' ? (
                <>
                    <span className="user-name">Olá, {session.user.name}</span>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="button-logout">
                        Sair
                    </button>
                </>
            ) : (
                <Link href="/login" className="button-login">
                    Login
                </Link>
            )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
