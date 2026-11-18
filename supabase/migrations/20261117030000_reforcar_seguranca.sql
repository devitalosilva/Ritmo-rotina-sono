-- =========================================================
-- Ritmo: reforço de segurança do banco
-- Já aplicada no projeto "Ritmo" (rrsgyrymsmkihrpsmpwj).
-- =========================================================

-- 1) Permissões mínimas.
--    O Supabase dá todas as permissões (inclusive TRUNCATE, que ignora RLS)
--    para anon e authenticated. Aqui fica só o que o site usa.
revoke all on table public.perfis, public.eventos from anon;
revoke all on table public.perfis, public.eventos from authenticated;

-- Perfil: ler o próprio e alterar só os campos editáveis (id e criado_em ficam travados)
grant select on table public.perfis to authenticated;
grant update (nome, celular, sexo, hora_acordar, tema) on table public.perfis to authenticated;

-- Eventos: ler, criar, alterar e excluir os próprios; id, usuario_id e criado_em ficam travados
grant select, delete on table public.eventos to authenticated;
grant insert (nome, horario, esforco, cor, frequencia, data_inicio, dias_semana) on table public.eventos to authenticated;
grant update (nome, horario, esforco, cor, frequencia, data_inicio, dias_semana) on table public.eventos to authenticated;

-- 2) Validação de textos e datas (defesa extra além do site)
alter table public.perfis
  add constraint perfis_nome_seguro check (btrim(nome) <> '' and nome !~ '[<>[:cntrl:]]');

alter table public.eventos
  add constraint eventos_nome_seguro check (btrim(nome) <> '' and nome !~ '[<>[:cntrl:]]'),
  add constraint eventos_data_valida check (data_inicio between date '2000-01-01' and date '2100-12-31'),
  add constraint eventos_dias_semana_tamanho check (cardinality(dias_semana) <= 7);

-- 3) O gatilho de cadastro limpa o nome antes de gravar
--    (tira < > e caracteres de controle), para o cadastro nunca falhar por isso.
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nome text := left(btrim(regexp_replace(coalesce(new.raw_user_meta_data ->> 'nome', ''), '[<>[:cntrl:]]', '', 'g')), 80);
  v_celular text := regexp_replace(coalesce(new.raw_user_meta_data ->> 'celular', ''), '\D', '', 'g');
  v_sexo text := new.raw_user_meta_data ->> 'sexo';
begin
  insert into public.perfis (id, nome, celular, sexo)
  values (
    new.id,
    case when v_nome <> '' then v_nome else left(split_part(new.email, '@', 1), 80) end,
    case when v_celular ~ '^[0-9]{10,11}$' then v_celular end,
    case when v_sexo in ('Feminino', 'Masculino', 'Outro', 'Prefiro não informar') then v_sexo end
  );
  return new;
end;
$$;
revoke execute on function public.criar_perfil_novo_usuario() from public, anon, authenticated;

-- 4) Limite de eventos por usuário (evita abuso e enchimento do banco)
create function public.limitar_eventos_por_usuario()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.eventos where usuario_id = new.usuario_id) >= 300 then
    raise exception 'Limite de 300 eventos por usuário atingido.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke execute on function public.limitar_eventos_por_usuario() from public, anon, authenticated;

create trigger limitar_eventos
  before insert on public.eventos
  for each row execute function public.limitar_eventos_por_usuario();
