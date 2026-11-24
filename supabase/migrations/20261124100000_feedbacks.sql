-- =========================================================
-- Ritmo: relatar problema, sugerir funcionalidade e feedback geral (24/11/2026)
-- Telas de Configurações > Ajuda e sobre, no app do celular.
--
-- Regras:
-- - Cada conta só INSERE mensagens com o próprio usuario_id (RLS).
-- - Ninguém lê pelo site, nem a própria conta (sem GRANT de SELECT para anon/authenticated).
--   Leia no painel do Supabase: Table Editor > feedbacks.
-- - No máximo 20 mensagens por conta a cada 24 horas (contra abuso).
-- - Excluir a conta apaga as mensagens dela junto (on delete cascade).
-- =========================================================
create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('problema', 'sugestao', 'feedback')),
  mensagem text not null check (char_length(mensagem) between 5 and 2000),
  detalhe text check (detalhe is null or char_length(detalhe) <= 40),
  versao text check (versao is null or versao ~ '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$'),
  idioma text check (idioma is null or idioma in ('pt-BR', 'en', 'es')),
  aparelho text check (aparelho is null or char_length(aparelho) <= 300),
  criado_em timestamptz not null default now()
);

comment on table public.feedbacks is
  'Relatos de problema, sugestões e feedback geral enviados pelo app (Configurações > Ajuda e sobre). Só inserção pelo site.';
comment on column public.feedbacks.tipo is 'problema = Relatar problema; sugestao = Sugerir funcionalidade; feedback = Feedback geral.';
comment on column public.feedbacks.detalhe is 'Problema: onde aconteceu (rotina, sono, relaxar, perfil, configuracoes, outro). Feedback geral: opiniao, elogio ou observacao.';
comment on column public.feedbacks.aparelho is 'Navegador e aparelho (user agent), só quando a pessoa deixa marcado no relato de problema.';

-- Índice da chave estrangeira e do limite por dia
create index if not exists feedbacks_usuario_criado_idx on public.feedbacks (usuario_id, criado_em desc);

alter table public.feedbacks enable row level security;

-- Só inserção, só das colunas que o site manda
revoke all on public.feedbacks from anon, authenticated;
grant insert (usuario_id, tipo, mensagem, detalhe, versao, idioma, aparelho) on public.feedbacks to authenticated;

drop policy if exists feedbacks_inserir_proprio on public.feedbacks;
create policy feedbacks_inserir_proprio on public.feedbacks
  for insert to authenticated
  with check (usuario_id = (select auth.uid()));

-- Limite por dia e data de envio sempre do servidor.
-- security definer: a contagem precisa ler a tabela, que a conta não pode ler.
create or replace function public.validar_feedback()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.feedbacks
      where usuario_id = new.usuario_id and criado_em > now() - interval '1 day') >= 20 then
    raise exception 'Você já mandou muitas mensagens hoje. Tente de novo amanhã.' using errcode = 'P0001';
  end if;
  new.criado_em := now();
  return new;
end;
$$;
revoke execute on function public.validar_feedback() from public, anon, authenticated;

drop trigger if exists feedbacks_validar on public.feedbacks;
create trigger feedbacks_validar
  before insert on public.feedbacks
  for each row execute function public.validar_feedback();
