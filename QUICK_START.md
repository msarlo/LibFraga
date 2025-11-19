# Guia Rápido - LibFraga

## 🚀 Início Rápido

### 1. Instalação
```bash
git clone https://github.com/msarlo/LibFraga.git
cd LibFraga
pip install -r requirements.txt
```

### 2. Executar o Sistema
```bash
python cli.py
```

### 3. Login Padrão
- **Email**: `admin@libfraga.com`
- **Senha**: `admin123`
- **Tipo**: Administrador

## 👥 Tipos de Usuário

### 🔴 Administrador
**Pode fazer:**
- ✅ Cadastrar novos usuários (admin, bibliotecário, aluno)
- ✅ Gerenciar livros
- ✅ Criar empréstimos
- ✅ Registrar devoluções
- ✅ Registrar pagamentos
- ✅ Ver todos os relatórios

### 🟡 Bibliotecário
**Pode fazer:**
- ❌ Cadastrar usuários
- ✅ Gerenciar livros
- ✅ Criar empréstimos
- ✅ Registrar devoluções
- ✅ Registrar pagamentos
- ✅ Ver todos os relatórios

### 🟢 Aluno
**Pode fazer:**
- ❌ Cadastrar usuários
- ❌ Gerenciar livros
- ❌ Criar empréstimos
- ❌ Registrar devoluções
- ❌ Registrar pagamentos
- ✅ Ver seus próprios dados
- ✅ Ver seus próprios empréstimos

## 📋 Fluxo de Uso Típico

### Como Administrador

1. **Cadastrar um bibliotecário**
   ```
   Menu → 1. Gerenciar Usuários → 1. Cadastrar novo usuário
   Tipo: 2. Bibliotecário
   ```

2. **Cadastrar alunos**
   ```
   Menu → 1. Gerenciar Usuários → 1. Cadastrar novo usuário
   Tipo: 3. Aluno
   ```

3. **Adicionar livros**
   ```
   Menu → 2. Gerenciar Livros → 1. Adicionar novo livro
   ```

4. **Criar empréstimo**
   ```
   Menu → 3. Gerenciar Empréstimos
   Informar: ID do empréstimo, ID do aluno, ID do livro
   ```

5. **Registrar devolução**
   ```
   Menu → 4. Registrar Devolução
   Informar: ID do empréstimo
   ```

6. **Ver livros em atraso**
   ```
   Menu → 6. Relatórios → 2. Livros em atraso (6.2)
   ```

### Como Aluno

1. **Ver meus dados**
   ```
   Menu → 1. Consultar meus dados cadastrais
   ```

2. **Ver meus empréstimos**
   ```
   Menu → 2. Consultar meus empréstimos (Relatório 6.1)
   ```

## 💰 Sistema de Multas

- **Período de empréstimo**: 14 dias
- **Multa por atraso**: R$ 1,00 por dia
- **Cálculo**: Automático na devolução
- **Pagamento**: Registrado pelo admin ou bibliotecário

## 🧪 Testar o Sistema

### Executar todos os testes
```bash
python -m unittest test_library_system.py -v
```

### Executar demonstração completa
```bash
python demo.py
```

## 📊 Exemplo de Uso Programático

```python
from library_system import LibrarySystem, UserRole

# Criar e fazer login
system = LibrarySystem()
admin = system.login("admin@libfraga.com", "admin123")

# Cadastrar usuário
aluno = system.register_user(
    "alu001", "João Silva", "joao@email.com", 
    "senha123", UserRole.STUDENT
)

# Adicionar livro
livro = system.add_book(
    "liv001", "Python Fluente", "Luciano Ramalho",
    "978-1-4919-4600-8", 5
)

# Criar empréstimo
emprestimo = system.create_loan("emp001", "alu001", "liv001")

# Ver empréstimos do aluno
system.logout()
system.login("joao@email.com", "senha123")
meus_emprestimos = system.report_books_by_student("alu001")
```

## 🆘 Solução de Problemas

### Erro: "PermissionError: Apenas administradores podem cadastrar usuários"
**Solução**: Você precisa fazer login como administrador para cadastrar usuários.

### Erro: "ValueError: Livro não disponível"
**Solução**: Todos os exemplares do livro estão emprestados. Aguarde devoluções ou adicione mais exemplares.

### Erro: "ValueError: Usuário não encontrado"
**Solução**: Verifique se o ID do usuário está correto e se o usuário foi cadastrado.

## 📚 Mais Informações

- **README.md**: Documentação completa
- **IMPLEMENTATION_NOTES.md**: Notas técnicas de implementação
- **demo.py**: Demonstração de todas as funcionalidades
- **test_library_system.py**: 34 testes automatizados

## 🎯 IDs Recomendados

Para facilitar o uso, siga estas convenções:

- **Usuários**: 
  - Admin: `adm001`, `adm002`, ...
  - Bibliotecário: `bib001`, `bib002`, ...
  - Aluno: `alu001`, `alu002`, ...

- **Livros**: `liv001`, `liv002`, ...

- **Empréstimos**: `emp001`, `emp002`, ...

- **Pagamentos**: `pag001`, `pag002`, ...

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue no repositório GitHub.
