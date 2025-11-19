# LibFraga - Sistema de Biblioteca

Sistema de gerenciamento de biblioteca desenvolvido em Python com suporte para múltiplos tipos de usuários, empréstimos, devoluções com multas, pagamentos e relatórios.

## 📋 Funcionalidades

### 1. Usuários (Administrador, Bibliotecário, Aluno)
- **Administrador**: Pode cadastrar novos usuários e realizar todas as operações
- **Bibliotecário**: Pode gerenciar livros, empréstimos, devoluções e visualizar relatórios
- **Aluno**: Pode apenas consultar seus próprios empréstimos e dados cadastrais

### 2. Livros
- Cadastro de livros com título, autor, ISBN e quantidade
- Controle de disponibilidade de exemplares
- Listagem de livros disponíveis

### 3. Empréstimo de Livros
- Criação de empréstimos (apenas admin e bibliotecário)
- Período padrão de 14 dias
- Controle automático de disponibilidade

### 4. Devolução de Livros
- Registro de devolução
- Cálculo automático de multas por atraso
- Multa de R$ 1,00 por dia de atraso

### 5. Pagamentos de Multas
- Registro de pagamento de multas
- Validação de valor pago

### 6. Relatórios
- **6.1 Livros emprestados por aluno**: Alunos podem consultar seus próprios empréstimos
- **6.2 Livros em atraso**: Admin e bibliotecário podem visualizar todos os livros atrasados com multas

## 🚀 Instalação

### Pré-requisitos
- Python 3.7 ou superior

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/msarlo/LibFraga.git
cd LibFraga
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

## 💻 Uso

### Interface de Linha de Comando (CLI)

Execute o CLI para interagir com o sistema:

```bash
python cli.py
```

#### Credenciais Padrão
- **Email**: admin@libfraga.com
- **Senha**: admin123
- **Tipo**: Administrador

### Exemplo de Uso Programático

```python
from library_system import LibrarySystem, UserRole

# Criar instância do sistema
system = LibrarySystem()

# Fazer login como administrador
admin = system.login("admin@libfraga.com", "admin123")

# Cadastrar um bibliotecário
librarian = system.register_user(
    "lib001", 
    "Maria Silva", 
    "maria@libfraga.com", 
    "senha123", 
    UserRole.LIBRARIAN
)

# Cadastrar um aluno
student = system.register_user(
    "stu001", 
    "João Santos", 
    "joao@email.com", 
    "senha123", 
    UserRole.STUDENT
)

# Adicionar um livro
book = system.add_book(
    "book001", 
    "Clean Code", 
    "Robert Martin", 
    "9780132350884", 
    5
)

# Criar um empréstimo
loan = system.create_loan("loan001", "stu001", "book001")

# Consultar empréstimos do aluno (login como aluno)
system.logout()
system.login("joao@email.com", "senha123")
loans = system.report_books_by_student("stu001")

# Relatório de livros em atraso (login como admin/bibliotecário)
system.logout()
system.login("admin@libfraga.com", "admin123")
overdue = system.report_overdue_books()
```

## 🧪 Testes

Execute os testes unitários:

```bash
python -m unittest test_library_system.py
```

Ou para ver detalhes:

```bash
python -m unittest test_library_system.py -v
```

## 📚 Estrutura do Projeto

```
LibFraga/
│
├── library_system.py       # Classes principais do sistema
├── cli.py                  # Interface de linha de comando
├── test_library_system.py  # Testes unitários
├── requirements.txt        # Dependências do projeto
├── .gitignore             # Arquivos ignorados pelo git
└── README.md              # Documentação
```

## 🔐 Controle de Acesso

### Permissões por Tipo de Usuário

| Operação | Administrador | Bibliotecário | Aluno |
|----------|---------------|---------------|-------|
| Cadastrar usuários | ✅ | ❌ | ❌ |
| Gerenciar livros | ✅ | ✅ | ❌ |
| Criar empréstimos | ✅ | ✅ | ❌ |
| Registrar devoluções | ✅ | ✅ | ❌ |
| Registrar pagamentos | ✅ | ✅ | ❌ |
| Ver todos os empréstimos | ✅ | ✅ | ❌ |
| Ver seus empréstimos | ✅ | ✅ | ✅ |
| Ver seus dados | ✅ | ✅ | ✅ |
| Ver relatório de atrasos | ✅ | ✅ | ❌ |

## 🛠️ Tecnologias

- Python 3.7+
- datetime (biblioteca padrão)
- typing (biblioteca padrão)
- enum (biblioteca padrão)
- unittest (biblioteca padrão)

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 👥 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📞 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.