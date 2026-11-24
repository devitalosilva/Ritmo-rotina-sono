-- =========================================================
-- Ritmo: evento com início e fim, e horário de acordar por dia da semana
--   eventos.horario_fim   : quando o evento termina (opcional). Antes do horário de
--                           início = termina no dia seguinte (ex.: plantão 22:00 às 06:00).
--   perfis.acordar_semana : 7 horários de acordar, de domingo (posição 1) a sábado (posição 7).
--                           Nulo = acorda todo dia em hora_acordar.
--                           A hora de deitar de cada noite usa o horário do dia SEGUINTE.
-- As duas colunas aceitam nulo: linhas antigas continuam valendo sem mudança.
-- Já aplicada no projeto "Ritmo" (rrsgyrymsmkihrpsmpwj).
-- =========================================================

alter table public.eventos
  add column horario_fim time;

alter table public.eventos
  add constraint eventos_horario_fim_diferente
    check (horario_fim is null or horario_fim <> horario);

alter table public.perfis
  add column acordar_semana time[];

alter table public.perfis
  add constraint perfis_acordar_semana_7_dias
    check (
      acordar_semana is null
      or (array_ndims(acordar_semana) = 1
          and cardinality(acordar_semana) = 7
          and array_position(acordar_semana, null) is null)
    );

-- As permissões de escrita do site são por coluna: libera só as novas
grant insert (horario_fim), update (horario_fim) on table public.eventos to authenticated;
grant update (acordar_semana) on table public.perfis to authenticated;

comment on column public.eventos.horario_fim is 'Fim do evento (opcional). Antes de horario = termina no dia seguinte.';
comment on column public.perfis.acordar_semana is 'Horário de acordar por dia da semana (domingo a sábado). Nulo = todo dia hora_acordar.';
