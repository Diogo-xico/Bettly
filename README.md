# Bettly

Torneio de apostas entre amigos para o Mundial 2026. Aplicação React + Vite + TypeScript com Tailwind CSS e Supabase (auth, base de dados e storage).

## Stack

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Auth, Postgres, Storage)
- [React Router](https://reactrouter.com/)
- Deploy: [Vercel](https://vercel.com/)

## Pré-requisitos

- Node.js (versão recente, recomendado 20+)
- Uma conta e projeto no [Supabase](https://supabase.com/)

## Configuração inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o projeto Supabase

1. Cria um novo projeto em [supabase.com](https://supabase.com/).
2. Vai a **Project Settings -> API** e copia o **Project URL** e a **anon public key**.

### 3. Configurar variáveis de ambiente

Copia o ficheiro `.env.example` para `.env` e preenche com os valores do teu projeto Supabase:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

O ficheiro `.env` está no `.gitignore` e nunca deve ser commitado.

### 4. Criar a base de dados

No Supabase, vai a **SQL Editor -> New query**, cola o conteúdo de [supabase/schema.sql](supabase/schema.sql) e executa (**Run**).

Este script cria:

- Tabela `profiles` (perfis dos utilizadores, saldo inicial, palpites, etc.) com Row Level Security.
- Trigger que cria automaticamente um perfil quando um novo utilizador se regista.
- Tabela `bets` (apostas) com Row Level Security e políticas de acesso.
- Bucket de storage público `bet-proofs` para os comprovativos (prints) das apostas, com políticas de upload/remoção restritas à pasta do próprio utilizador.

### 5. Criar contas dos participantes

No Supabase, vai a **Authentication -> Users -> Add user** e cria uma conta (email + password) para cada participante. Um perfil é criado automaticamente na tabela `profiles` graças ao trigger do passo anterior.

### 6. Tornar um utilizador administrador

Por defeito, todos os utilizadores são criados com `is_admin = false`. Para dar permissões de admin a alguém, corre no SQL Editor:

```sql
update public.profiles set is_admin = true where id = '<user-id>';
```

O `user-id` encontra-se em **Authentication -> Users**.

## Desenvolvimento

```bash
npm run dev
```

A aplicação fica disponível em `http://localhost:5173` (porta default do Vite).

## Build

```bash
npm run build
```

## Preview do build

```bash
npm run preview
```
## Deploy

O projeto está configurado para deploy no Vercel ([vercel.json](vercel.json) faz rewrite de todas as rotas para `index.html`, necessário para o React Router). Garante que defines as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas configurações do projeto no Vercel.

## Exemplos da app
<img width="760" height="948" alt="Captura de ecrã 2026-08-01 211216" src="https://github.com/user-attachments/assets/4c1cdb48-4765-464e-93a6-db375206d6a7" />
<img width="721" height="951" alt="Captura de ecrã 2026-08-01 211228" src="https://github.com/user-attachments/assets/5bd25793-e0f3-4381-b354-f37104727d42" />
<img width="763" height="870" alt="Captura de ecrã 2026-08-01 211234" src="https://github.com/user-attachments/assets/2f8b6696-1bfa-4f55-ad22-23b2596e8a15" />
<img width="710" height="948" alt="Captura de ecrã 2026-08-01 211243" src="https://github.com/user-attachments/assets/ccec9877-a89f-43ec-ab58-affa59d17581" />
<img width="764" height="947" alt="Captura de ecrã 2026-08-01 211254" src="https://github.com/user-attachments/assets/2fad1755-3e9a-43c4-afef-4a8e229dcec7" />

