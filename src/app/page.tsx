import AuthForm from './components/AuthForm';

export default function Home() {
  return (
    <div>
      <h1>Bem-vindo ao LibFraga</h1>

      <section className="feature-section">
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h2>Gerencie livros, empréstimos e usuários</h2>
            <p>
              Acesse seu acervo, registre empréstimos e acompanhe multas. Faça login para começar a usar o sistema.
            </p>
            <ul style={{ marginTop: '1rem' }}>
              <li>Lista de livros com controle de disponibilidade</li>
              <li>Registro de empréstimos e devoluções</li>
              <li>Controle de multas e relatórios</li>
            </ul>
          </div>

          <div style={{ width: 420 }}>
            <div className="form-container">
              <AuthForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
