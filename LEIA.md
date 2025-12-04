# LibFraga - Guia de Configuração

Sistema de gerenciamento de biblioteca desenvolvido com Next.js 14, TypeScript, Prisma e SQLite.

## Pré-requisitos

- Node.js 18+
- npm

## Configuração do Ambiente

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd LibFraga
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
DATABASE_URL="file:/CAMINHO/ABSOLUTO/DO/PROJETO/prisma/dev.db"
NEXTAUTH_SECRET="supersecretkey123"
NEXTAUTH_URL="http://localhost:3000"
```

**Importante:** Substitua `/CAMINHO/ABSOLUTO/DO/PROJETO` pelo caminho real do projeto na sua máquina.

Exemplo Linux/Mac:
```env
DATABASE_URL="file:/home/usuario/projetos/LibFraga/prisma/dev.db"
```

Exemplo Windows:
```env
DATABASE_URL="file:C:/Users/usuario/Documents/LibFraga/prisma/dev.db"
```

### 4. Gere o cliente Prisma

```bash
npx prisma generate
```

### 5. Configure o banco de dados

Se for a primeira vez ou quiser um banco limpo:

```bash
npx prisma migrate dev
```

### 6. Inicie o servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

## Usuários de Teste

| Tipo          | Email                      | Senha   |
|---------------|----------------------------|---------|
| Administrador | admin@teste.com            | 123456  |
| Bibliotecário | bibliotecario@teste.com    | 123456  |
| Aluno         | aluno@teste.com            | 123456  |

## Comandos Úteis

| Comando                  | Descrição                              |
|--------------------------|----------------------------------------|
| `npm run dev`            | Inicia o servidor de desenvolvimento   |
| `npm run build`          | Compila para produção                  |
| `npm run lint`           | Executa o ESLint                       |
| `npm run prisma:generate`| Gera o cliente Prisma                  |
| `npm run prisma:migrate` | Aplica migrações do banco              |
| `npm run prisma:studio`  | Abre o editor visual do banco          |

## Estrutura do Projeto

```
src/
├── app/                    # Páginas e rotas (Next.js App Router)
│   ├── api/                # Rotas da API REST
│   ├── books/              # Páginas de livros
│   ├── components/         # Componentes globais (Header, Provider)
│   └── login/              # Página de login
├── lib/                    # Utilitários (prisma, isbn)
├── types/                  # Tipos TypeScript e DTOs
└── generated/              # Cliente Prisma (gerado automaticamente)
```

## Permissões por Papel

| Funcionalidade           | Admin | Bibliotecário | Aluno |
|--------------------------|-------|---------------|-------|
| Ver livros               | ✓     | ✓             | ✓     |
| Adicionar/Editar livros  | ✓     | ✓             | ✗     |
| Excluir livros           | ✓     | ✓             | ✗     |
| Gerenciar usuários       | ✓     | ✗             | ✗     |
| Ver próprios empréstimos | ✓     | ✓             | ✓     |
