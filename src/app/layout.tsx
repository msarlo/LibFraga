import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'LibFraga - Sistema de Biblioteca',
  description: 'Sistema de gerenciamento de biblioteca',
};

function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <Link href="/" className="logo">
          LibFraga
        </Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/books">Livros</Link>
          <Link href="/users">Usuários</Link>
          <Link href="/loans">Empréstimos</Link>
        </div>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
