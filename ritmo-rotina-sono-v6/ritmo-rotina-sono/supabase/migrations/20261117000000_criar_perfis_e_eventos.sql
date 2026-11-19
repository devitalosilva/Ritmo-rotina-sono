-- =========================================================
-- Ritmo: perfis dos usuários e eventos da rotina
-- E-mail e senha ficam no Supabase Auth (auth.users).
-- Esta migração já foi aplicada no projeto "Ritmo" (rrsgyrymsmkihrpsmpwj).
-- Para recriar o banco em outro projeto, rode este arquivo no SQL Editor.
-- =========================================================

-- Perfil: dados extras do usuário (uma linha por conta)
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 80),
  celular text check (celular ~ '^[0-9]{10,11}$'),
  sexo text check (sexo in ('Feminino', 'Masculino', 'Outro', 'Prefiro não informar')),
  hora_acordar time not null default '07:00',
  criado_em timestamptz not null default now()
);
comment on table public.perfis is 'Dados do usuário do site Ritmo (nome, celular, sexo, hora de acordar).';

-- Eventos da rotina
create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 60),
  horario time not null,
  esforco smallint not null check (esforco between 1 and 3),       -- 1 leve, 2 médio, 3 pesado
  cor text not null check (cor ~ '^#[0-9A-Fa-f]{6}$'),
  frequencia text not null check (frequencia in ('diaria', 'semanal', 'mensal', 'unica')),
  data_inicio date not null default current_date,                   -- data do evento único ou início da repetição
  dias_semana smallint[] not null default '{}'                      -- 0 = domingo ... 6 = sábado (só semanal)
    check (dias_semana <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  criado_em timestamptz not null default now(),
  constraint semanal_precisa_de_dias check (frequencia <> 'semanal' or cardinality(dias_semana) > 0)
);
comment on table public.eventos is 'Eventos da rotina de cada usuário, com esforço e frequência.';
create index eventos_usuario_id_idx on public.eventos (usuario_id);

-- Acesso pela API: só usuários conectados
grant select, update on public.perfis to authenticated;
grant select, insert, update, delete on public.eventos to authenticated;

-- Segurança por linha: cada pessoa só vê e altera os próprios dados
alter table public.perfis enable row level security;
alter table public.eventos enable row level security;

create policy "Perfis: ler o próprio" on public.perfis
  for select to authenticated using ((select auth.uid()) = id);
create policy "Perfis: atualizar o próprio" on public.perfis
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Eventos: ler os próprios" on public.eventos
  for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Eventos: criar os próprios" on public.eventos
  for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Eventos: alterar os próprios" on public.eventos
  for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Eventos: excluir os próprios" on public.eventos
  for delete to authenticated using ((select auth.uid()) = usuario_id);

-- Cria o perfil automaticamente no cadastro, com nome, celular e sexo
-- enviados em options.data do signUp. Valores inválidos viram nulo para
-- não bloquear o cadastro.
create function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nome text := left(trim(coalesce(new.raw_user_meta_data ->> 'nome', '')), 80);
  v_celular text := regexp_replace(coalesce(new.raw_user_meta_data ->> 'celular', ''), '\D', '', 'g');
  v_sexo text := new.raw_user_meta_data ->> 'sexo';
begin
  insert into public.perfis (id, nome, celular, sexo)
  values (
    new.id,
    case when v_nome <> '' then v_nome else split_part(new.email, '@', 1) end,
    case when v_celular ~ '^[0-9]{10,11}$' then v_celular end,
    case when v_sexo in ('Feminino', 'Masculino', 'Outro', 'Prefiro não informar') then v_sexo end
  );
  return new;
end;
$$;
revoke execute on function public.criar_perfil_novo_usuario() from public, anon, authenticated;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();
