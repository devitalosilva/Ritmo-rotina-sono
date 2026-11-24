-- =========================================================
-- Ritmo: correções do teste de invasão (18/11/2026)
-- Já aplicada no projeto "Ritmo" (rrsgyrymsmkihrpsmpwj).
-- =========================================================

-- 1) FALHA CRÍTICA CORRIGIDA: excluir a conta exige senha digitada há pouco tempo,
--    conferida NO SERVIDOR.
--    Antes, a senha só era pedida na tela. Quem tivesse um token roubado (mesmo de dias
--    atrás) apagava a conta chamando POST /rest/v1/rpc/excluir_minha_conta direto.
--    O claim "amr" do token do Supabase Auth guarda quando a senha foi usada:
--      [{"method": "password", "timestamp": 1700000000}]
--    Token renovado (refresh) mantém o horário do login original, então um token antigo
--    não passa. O site faz login com a senha logo antes de excluir (DB.confirmarSenha),
--    então o token novo passa nesta conferência.
create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
  v_amr jsonb := auth.jwt() -> 'amr';
  v_senha_em bigint;
begin
  if v_usuario is null then
    raise exception 'Entre na sua conta para excluí-la.' using errcode = 'P0001';
  end if;

  if jsonb_typeof(v_amr) is distinct from 'array' then
    v_amr := '[]'::jsonb;
  end if;

  select max((m ->> 'timestamp')::bigint) into v_senha_em
  from jsonb_array_elements(v_amr) as m
  where jsonb_typeof(m) = 'object'
    and m ->> 'method' = 'password'
    and (m ->> 'timestamp') ~ '^[0-9]{1,12}$';

  if v_senha_em is null or v_senha_em < extract(epoch from now())::bigint - 600 then
    raise exception 'Por segurança, digite sua senha de novo para excluir a conta.' using errcode = 'P0001';
  end if;

  delete from auth.users where id = v_usuario;
end;
$$;
revoke execute on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
comment on function public.excluir_minha_conta() is
  'Exclui a conta de quem está logado. Exige senha digitada nos últimos 10 minutos (claim amr do token).';

-- 2) RISCO LATENTE CORRIGIDO: negar por padrão.
--    O padrão do Supabase dá a anon/authenticated acesso total a toda tabela, sequência e
--    função criada depois no schema public. Uma tabela nova esquecida sem RLS ficaria
--    aberta para qualquer visitante. Agora objetos novos criados pelo papel postgres
--    (SQL Editor, migrações) nascem sem acesso; cada um precisa de GRANT explícito e RLS,
--    como já fazem as migrações do Ritmo.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated, public;

-- Papel interno supabase_admin: o projeto não permite alterar daqui (é gerido pelo Supabase).
do $$
begin
  execute 'alter default privileges for role supabase_admin in schema public revoke all on tables from anon, authenticated';
  execute 'alter default privileges for role supabase_admin in schema public revoke all on sequences from anon, authenticated';
  execute 'alter default privileges for role supabase_admin in schema public revoke execute on functions from anon, authenticated, public';
exception when insufficient_privilege then
  raise notice 'Sem permissão para alterar os padrões do papel supabase_admin; os do papel postgres foram alterados.';
end $$;
