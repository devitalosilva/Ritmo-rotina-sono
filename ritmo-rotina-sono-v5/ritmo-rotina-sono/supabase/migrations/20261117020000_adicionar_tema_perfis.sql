-- Preferência de aparência do usuário (página Meu perfil)
-- Já aplicada no projeto "Ritmo" (rrsgyrymsmkihrpsmpwj).
alter table public.perfis
  add column tema text not null default 'sistema'
  check (tema in ('sistema', 'claro', 'escuro'));
comment on column public.perfis.tema is 'Preferência de aparência: sistema (segue o aparelho), claro ou escuro.';
