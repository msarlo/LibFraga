export default function Home() {
  return (
    <main className="container">
      <h1>LibFraga - Sistema de Biblioteca</h1>

      <section>
        <h2>Funcionalidades do Sistema</h2>

        <div className="feature-section">
          <h3>1. Usuários</h3>
          <ul>
            <li><strong>Administrador:</strong> Pode cadastrar outros usuários</li>
            <li><strong>Bibliotecário:</strong> Pode realizar todas as ações administrativas</li>
            <li><strong>Aluno:</strong> Pode consultar seus próprios empréstimos e dados cadastrais</li>
          </ul>
        </div>

        <div className="feature-section">
          <h3>2. Gestão de Livros</h3>
          <p>Cadastro e gerenciamento do acervo da biblioteca</p>
        </div>

        <div className="feature-section">
          <h3>3. Empréstimos</h3>
          <p>Sistema de empréstimo de livros para alunos</p>
        </div>

        <div className="feature-section">
          <h3>4. Devoluções</h3>
          <p>Controle de devoluções com sistema de multas por atraso</p>
        </div>

        <div className="feature-section">
          <h3>5. Pagamentos</h3>
          <p>Gestão de pagamentos de multas</p>
        </div>

        <div className="feature-section">
          <h3>6. Relatórios</h3>
          <ul>
            <li>Livros emprestados por aluno</li>
            <li>Livros em atraso</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
