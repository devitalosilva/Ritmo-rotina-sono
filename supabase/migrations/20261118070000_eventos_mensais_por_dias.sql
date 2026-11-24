-- =========================================================
-- Ritmo: evento mensal com a mesma escolha de dias do evento semanal
--   dias_mes    : dias do mês (1 a 31; 32 = último dia do mês)
--   semanas_mes : semanas do mês (1ª a 4ª; 5 = última), junto com dias_semana
--                 (1ª semana = dias 1 a 7; última = os 7 últimos dias do mês)
-- Eventos mensais antigos (as duas listas vazias) continuam no dia do mês de data_inicio.
-- Já aplicada no projeto "Ritmo" (rrsgyrymsmkihrpsmpwj).
-- =========================================================
alter table public.eventos
  add column dias_mes smallint[] not null default '{}',
  add column semanas_mes smallint[] not null default '{}';

alter table public.eventos
  add constraint eventos_dias_mes_check
    check (dias_mes <@ '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32}'::smallint[]
           and cardinality(dias_mes) <= 32),
  add constraint eventos_semanas_mes_check
    check (semanas_mes <@ '{1,2,3,4,5}'::smallint[] and cardinality(semanas_mes) <= 5),
  add constraint mensal_por_semana_precisa_de_dias
    check (cardinality(semanas_mes) = 0 or cardinality(dias_semana) > 0);

grant insert (dias_mes, semanas_mes), update (dias_mes, semanas_mes) on table public.eventos to authenticated;

comment on column public.eventos.dias_mes is 'Evento mensal: dias do mês (1 a 31; 32 = último dia).';
comment on column public.eventos.semanas_mes is 'Evento mensal por semana: 1ª a 4ª semana (dias 1-7, 8-14...) ou 5 = última semana; usa dias_semana.';
