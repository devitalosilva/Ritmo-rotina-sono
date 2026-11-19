-- =========================================================
-- Ritmo: validações de consistência direto no PostgreSQL
-- (o site também valida, mas o banco é a última palavra)
-- Já aplicada no projeto "Ritmo" (rrsgyrymsmkihrpsmpwj).
-- =========================================================

-- Eventos: campos do mensal só no mensal, um modo mensal por vez, dias da semana só onde fazem sentido
alter table public.eventos
  add constraint eventos_campos_mensais_so_no_mensal
    check (frequencia = 'mensal' or (cardinality(dias_mes) = 0 and cardinality(semanas_mes) = 0)),
  add constraint eventos_um_modo_mensal
    check (cardinality(dias_mes) = 0 or cardinality(semanas_mes) = 0),
  add constraint eventos_dias_semana_coerentes
    check (cardinality(dias_semana) = 0 or frequencia = 'semanal' or cardinality(semanas_mes) > 0);

-- Diário de sono: deitar e acordar no mesmo horário não é uma noite válida
alter table public.registros_sono
  add constraint registros_sono_horas_diferentes check (hora_deitar <> hora_acordar);

-- Check-in emocional: estresse, ansiedade e fadiga vão juntos (os três ou nenhum)
alter table public.checkins_diarios
  add constraint checkins_emocoes_completas
    check (num_nonnulls(estresse_noite, ansiedade_noite, fadiga_noite) in (0, 3));

-- Perfil: no máximo os 4 canais de lembrete existentes
alter table public.perfis
  add constraint perfis_canais_lembrete_tamanho check (cardinality(canais_lembrete) <= 4);
