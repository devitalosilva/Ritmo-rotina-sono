-- =========================================================
-- Ritmo: rotina mínima, check-in emocional, humor ao acordar e exclusão de conta
-- Já aplicada no projeto "Ritmo" (rrsgyrymsmkihrpsmpwj).
-- =========================================================

-- 1) Eventos essenciais (continuam visíveis no modo rotina mínima)
alter table public.eventos add column essencial boolean not null default false;
grant insert (essencial), update (essencial) on table public.eventos to authenticated;

-- 2) Check-in do dia: modo rotina mínima, copos de água e emoções antes de dormir (1 a 5)
alter table public.checkins_diarios
  add column modo_minimo boolean not null default false,
  add column agua_copos smallint not null default 0 check (agua_copos between 0 and 30),
  add column estresse_noite smallint check (estresse_noite between 1 and 5),
  add column ansiedade_noite smallint check (ansiedade_noite between 1 and 5),
  add column fadiga_noite smallint check (fadiga_noite between 1 and 5);
grant insert (modo_minimo, agua_copos, estresse_noite, ansiedade_noite, fadiga_noite),
      update (modo_minimo, agua_copos, estresse_noite, ansiedade_noite, fadiga_noite)
  on table public.checkins_diarios to authenticated;

-- 3) Humor ao acordar no registro de sono (1 a 5, opcional)
alter table public.registros_sono add column humor smallint check (humor between 1 and 5);
grant insert (humor), update (humor) on table public.registros_sono to authenticated;

-- 4) Excluir a própria conta.
--    Apaga o usuário do Supabase Auth; perfis, eventos, registros de sono, check-ins
--    e integrações saem junto (on delete cascade). Só age sobre quem está logado.
--    O aviso 0029 do Security Advisor ("SECURITY DEFINER executável por authenticated")
--    é esperado aqui: a função existe justamente para o usuário logado chamar, e só
--    apaga a linha de auth.uid().
create function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
begin
  if v_usuario is null then
    raise exception 'Entre na sua conta para excluí-la.' using errcode = 'P0001';
  end if;
  delete from auth.users where id = v_usuario;
end;
$$;
revoke execute on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
comment on function public.excluir_minha_conta() is 'Exclui a conta de quem está logado e todos os dados ligados a ela.';
