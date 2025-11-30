export default function Home() {
  return (
    <div>
      <h1>Bem-vindo ao LibFraga</h1>
      <p style={{ textAlign: 'center', marginTop: '-1.5rem', marginBottom: '3rem', fontSize: '1.2rem', color: '#666' }}>
        Sistema de Gerenciamento de Biblioteca
      </p>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Total de Livros</h3>
          <p className="stat">--</p>
        </div>
        <div className="card">
          <h3>Empréstimos Ativos</h3>
          <p className="stat">--</p>
        </div>
        <div className="card">
          <h3>Usuários Cadastrados</h3>
          <p className="stat">--</p>
        </div>
        <div className="card">
          <h3>Livros em Atraso</h3>
          <p className="stat">--</p>
        </div>
      </div>
    </div>
  );
}
