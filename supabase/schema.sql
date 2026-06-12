-- ============================================================
-- Torneio de Apostas - Mundial 2026
-- Corre este script inteiro no SQL Editor do Supabase
-- (Project -> SQL Editor -> New query -> colar -> Run)
-- ============================================================

-- ----------------------------
-- 1. Tabela de perfis
-- ----------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  is_admin boolean not null default false,
  starting_balance numeric not null default 1000,
  predicted_champion text,
  predicted_top_scorer text,
  actual_champion text,
  actual_top_scorer text,
  created_at timestamptz not null default now()
);

-- Caso a tabela já exista de uma instalação anterior, adiciona as colunas novas
alter table public.profiles add column if not exists predicted_champion text;
alter table public.profiles add column if not exists predicted_top_scorer text;
alter table public.profiles add column if not exists actual_champion text;
alter table public.profiles add column if not exists actual_top_scorer text;

alter table public.profiles enable row level security;

-- Qualquer pessoa autenticada pode ver os perfis (necessário para o leaderboard)
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Cada utilizador pode atualizar o seu próprio perfil (ex: mudar o nome)
-- Nota: para mudar is_admin / starting_balance de alguém, faz isso aqui no SQL Editor,
-- por exemplo: update public.profiles set is_admin = true where id = '...';
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Cria automaticamente um perfil quando um novo utilizador é criado no Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ----------------------------
-- 2. Tabela de apostas
-- ----------------------------
create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  description text not null,
  odd numeric not null check (odd >= 1.2 and odd <= 10),
  stake numeric not null check (stake > 0),
  status text not null default 'pending' check (status in ('pending', 'won', 'lost', 'void')),
  proof_url text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists bets_user_id_idx on public.bets (user_id);

alter table public.bets enable row level security;

-- Todos os utilizadores autenticados podem ver todas as apostas (transparência do torneio)
create policy "bets_select_authenticated"
  on public.bets for select
  to authenticated
  using (true);

-- Um utilizador só pode criar apostas em seu próprio nome
create policy "bets_insert_own"
  on public.bets for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Um utilizador pode editar a sua própria aposta enquanto estiver "pending"
-- (e não pode usar isto para mudar o status para won/lost/void)
create policy "bets_update_own_pending"
  on public.bets for update
  to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

-- Um utilizador pode apagar a sua própria aposta enquanto estiver "pending"
create policy "bets_delete_own_pending"
  on public.bets for delete
  to authenticated
  using (auth.uid() = user_id and status = 'pending');

-- Admins podem atualizar qualquer aposta (para resolver won/lost/void)
create policy "bets_update_admin"
  on public.bets for update
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));


-- ----------------------------
-- 3. Storage para os comprovativos (prints)
-- ----------------------------
insert into storage.buckets (id, name, public)
values ('bet-proofs', 'bet-proofs', true)
on conflict (id) do nothing;

-- Utilizadores autenticados podem fazer upload para a sua própria pasta: {user_id}/ficheiro.png
create policy "bet_proofs_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'bet-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Utilizadores podem apagar/substituir os seus próprios ficheiros
create policy "bet_proofs_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'bet-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Leitura é pública (bucket público), não precisa de policy de select.


-- ============================================================
-- Fim do script.
-- Próximo passo: cria as contas dos participantes em
-- Authentication -> Users -> Add user (email + password).
-- Para tornar alguém admin:
--   update public.profiles set is_admin = true where id = '<user-id>';
-- ============================================================
