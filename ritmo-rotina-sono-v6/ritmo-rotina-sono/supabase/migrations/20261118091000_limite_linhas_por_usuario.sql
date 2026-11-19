-- =========================================================
-- Ritmo: teto de linhas por conta (teste de invasão, 18/11/2026)
-- Já aplicada no projeto "Ritmo" (rrsgyrymsmkihrpsmpwj).
--
-- Ataque de esgotamento encontrado: com uma única requisição, uma conta gravava
-- ~9.800 noites e ~10.200 check-ins (um por dia desde o ano 2000). Com várias contas,
-- dava para encher o banco do plano gratuito e travar o site para todo mundo.
-- Agora há um teto por conta, como já existia para eventos (300).
-- Atualizar uma data já gravada (upsert) continua funcionando no limite.
-- =========================================================
create or replace function public.validar_registro_sono()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.data > current_date + 1 then
    raise exception 'O registro de sono não pode ser de uma data futura.' using errcode = 'P0001';
  end if;
  if tg_op = 'INSERT'
     and not exists (select 1 from public.registros_sono where usuario_id = new.usuario_id and data = new.data)
     and (select count(*) from public.registros_sono where usuario_id = new.usuario_id) >= 1500 then
    raise exception 'Limite de 1.500 noites registradas atingido. Exclua noites antigas para registrar novas.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create or replace function public.validar_checkin()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Dia de descanso só pode ser planejado para hoje ou depois (1 dia de folga por fuso horário)
  if new.dia_descanso and (tg_op = 'INSERT' or not old.dia_descanso) and new.data < current_date - 1 then
    raise exception 'Dias de descanso precisam ser planejados para hoje ou para frente.' using errcode = 'P0001';
  end if;
  if new.data > current_date + 400 then
    raise exception 'Data muito distante.' using errcode = 'P0001';
  end if;
  if tg_op = 'INSERT'
     and not exists (select 1 from public.checkins_diarios where usuario_id = new.usuario_id and data = new.data)
     and (select count(*) from public.checkins_diarios where usuario_id = new.usuario_id) >= 2000 then
    raise exception 'Limite de 2.000 dias de check-in atingido. Exclua dias antigos para continuar.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke execute on function public.validar_registro_sono() from public, anon, authenticated;
revoke execute on function public.validar_checkin() from public, anon, authenticated;
