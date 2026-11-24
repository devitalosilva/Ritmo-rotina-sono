-- Registros importados de wearables não trazem a energia subjetiva.
-- O site continua exigindo a energia nos registros manuais.
-- Já aplicada no projeto "Ritmo" (rrsgyrymsmkihrpsmpwj).
alter table public.registros_sono alter column energia drop not null;
comment on column public.registros_sono.energia is 'Energia ao acordar, de 1 a 5. Vazio em registros importados de wearables.';
