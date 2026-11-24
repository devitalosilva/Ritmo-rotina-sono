-- =========================================================
-- Ritmo: diário de sono, ritual noturno, lembretes e integrações
-- Já aplicada no projeto "Ritmo" (rrsgyrymsmkihrpsmpwj).
-- =========================================================

-- 1) Lembretes no perfil
alter table public.perfis
  add column lembrete_ritual boolean not null default false,
  add column lembrete_diario boolean not null default false,
  add column hora_lembrete_diario time not null default '07:30',
  add column canais_lembrete text[] not null default '{navegador}'
    check (canais_lembrete <@ array['navegador', 'email', 'whatsapp', 'telegram']::text[]);
grant update (lembrete_ritual, lembrete_diario, hora_lembrete_diario, canais_lembrete) on table public.perfis to authenticated;

-- Função comum: atualiza a coluna atualizado_em
create function public.marcar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;
revoke execute on function public.marcar_atualizado_em() from public, anon, authenticated;

-- 2) Registro de sono: uma linha por noite, identificada pela data em que a pessoa acordou
create table public.registros_sono (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data date not null check (data between date '2000-01-01' and date '2100-12-31'),
  hora_deitar time not null,
  latencia_min smallint not null default 0 check (latencia_min between 0 and 240),
  despertares smallint not null default 0 check (despertares between 0 and 30),
  hora_acordar time not null,
  energia smallint not null check (energia between 1 and 5),
  -- Origem do dado: manual ou importado de um wearable / agregador de saúde
  origem text not null default 'manual' check (origem in ('manual', 'apple_health', 'google_fit', 'garmin', 'oura')),
  id_externo text check (id_externo is null or char_length(id_externo) <= 200),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (usuario_id, data)
);
comment on table public.registros_sono is 'Diário de sono: hora de deitar, latência, despertares, hora de acordar e energia (1 a 5).';

-- 3) Check-in do dia: passos do ritual noturno concluídos e dia de descanso planejado
create table public.checkins_diarios (
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data date not null check (data between date '2000-01-01' and date '2100-12-31'),
  ritual_concluidos text[] not null default '{}'
    check (cardinality(ritual_concluidos) <= 20 and array_to_string(ritual_concluidos, ',') ~ '^[a-z0-9_,-]*$'),
  dia_descanso boolean not null default false,
  atualizado_em timestamptz not null default now(),
  primary key (usuario_id, data)
);
comment on table public.checkins_diarios is 'Ritual de desaceleração concluído por dia e dias de descanso planejados (não quebram a sequência).';

-- 4) Integrações com wearables e agregadores de saúde (escala futura).
--    Tokens de acesso NÃO ficam aqui: devem ficar no Vault ou em um schema privado,
--    lidos só por Edge Functions. Linhas são criadas pelo servidor (service_role).
create table public.integracoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  provedor text not null check (provedor in ('apple_health', 'google_fit', 'garmin', 'oura')),
  status text not null default 'pendente' check (status in ('pendente', 'conectado', 'erro', 'desconectado')),
  ultimo_sincronismo timestamptz,
  criado_em timestamptz not null default now(),
  unique (usuario_id, provedor)
);
comment on table public.integracoes is 'Conexões com Apple Health, Google Fit, Garmin e Oura. Preparada para importação automática de sono.';

-- 5) Validações que dependem da data de hoje (feitas em gatilho, não em CHECK)
create function public.validar_registro_sono()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.data > current_date + 1 then
    raise exception 'O registro de sono não pode ser de uma data futura.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke execute on function public.validar_registro_sono() from public, anon, authenticated;

create function public.validar_checkin()
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
  return new;
end;
$$;
revoke execute on function public.validar_checkin() from public, anon, authenticated;

create trigger validar_registro before insert or update on public.registros_sono
  for each row execute function public.validar_registro_sono();
create trigger marcar_atualizado before update on public.registros_sono
  for each row execute function public.marcar_atualizado_em();
create trigger validar_checkin before insert or update on public.checkins_diarios
  for each row execute function public.validar_checkin();
create trigger marcar_atualizado before update on public.checkins_diarios
  for each row execute function public.marcar_atualizado_em();

-- 6) Permissões mínimas (visitante sem login não acessa nada)
revoke all on table public.registros_sono, public.checkins_diarios, public.integracoes from anon, authenticated;

grant select, delete on table public.registros_sono to authenticated;
grant insert (data, hora_deitar, latencia_min, despertares, hora_acordar, energia) on table public.registros_sono to authenticated;
grant update (data, hora_deitar, latencia_min, despertares, hora_acordar, energia) on table public.registros_sono to authenticated;

grant select, delete on table public.checkins_diarios to authenticated;
grant insert (data, ritual_concluidos, dia_descanso) on table public.checkins_diarios to authenticated;
grant update (data, ritual_concluidos, dia_descanso) on table public.checkins_diarios to authenticated;

-- Integrações: o usuário vê e pode remover as próprias; criar e atualizar é papel do servidor
grant select, delete on table public.integracoes to authenticated;

-- 7) Segurança por linha: cada pessoa só acessa as próprias linhas
alter table public.registros_sono enable row level security;
alter table public.checkins_diarios enable row level security;
alter table public.integracoes enable row level security;

create policy "Sono: ler os próprios" on public.registros_sono
  for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Sono: criar os próprios" on public.registros_sono
  for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Sono: alterar os próprios" on public.registros_sono
  for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Sono: excluir os próprios" on public.registros_sono
  for delete to authenticated using ((select auth.uid()) = usuario_id);

create policy "Check-in: ler os próprios" on public.checkins_diarios
  for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Check-in: criar os próprios" on public.checkins_diarios
  for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Check-in: alterar os próprios" on public.checkins_diarios
  for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Check-in: excluir os próprios" on public.checkins_diarios
  for delete to authenticated using ((select auth.uid()) = usuario_id);

create policy "Integrações: ler as próprias" on public.integracoes
  for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Integrações: remover as próprias" on public.integracoes
  for delete to authenticated using ((select auth.uid()) = usuario_id);
