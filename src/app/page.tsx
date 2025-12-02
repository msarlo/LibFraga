import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AuthForm from './components/AuthForm';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1>Bem-vindo ao LibFraga</h1>

      <section className="feature-section">
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h2>Gerencie livros, empréstimos e usuários</h2>
            <p>
              Acesse seu acervo, registre empréstimos e acompanhe multas.
              {!session && " Faça login para começar a usar o sistema."}
            </p>
            <ul style={{ marginTop: '1rem' }}>
              <li>Lista de livros com controle de disponibilidade</li>
              <li>Registro de empréstimos e devoluções</li>
              <li>Controle de multas e relatórios</li>
            </ul>
          </div>

          <div style={{ width: 420 }}>
            <div className="form-container">
              {session ? (
                <div style={{ textAlign: 'center' }}>
                  <h3>Olá, {session.user?.name || 'Usuário'}!</h3>
                  <p>Você já está logado.</p>
                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link href="/books" className="btn btn-primary">
                      Acessar Sistema
                    </Link>
                  </div>
                </div>
              ) : (
                <AuthForm />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
