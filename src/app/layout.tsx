import type { Metadata } from 'next';
import './globals.css';
import Provider from './components/Provider';
import Header from './components/Header';

export const metadata: Metadata = {
  title: 'LibFraga - Sistema de Biblioteca',
  description: 'Sistema de gerenciamento de biblioteca',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Provider>
          <Header />
          <main className="container">{children}</main>
        </Provider>
      </body>
    </html>
  );
}
