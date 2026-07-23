-- Persistent competency template management.
-- Keeps the default template unique and immutable and saves template aggregates atomically.

do $$
begin
  if (
    select count(*)
    from public.templates_competencia
    where eh_padrao
  ) > 1 then
    raise exception using
      errcode = '23505',
      message = 'MULTIPLE_DEFAULT_TEMPLATES',
      detail = 'Existe mais de um template marcado como padrão. Corrija os dados antes de reaplicar a migração.';
  end if;
end;
$$;

create unique index if not exists templates_competencia_unico_padrao_idx
  on public.templates_competencia ((eh_padrao))
  where eh_padrao;

do $$
declare
  v_template_id uuid;
begin
  if not exists (
    select 1
    from public.templates_competencia
    where eh_padrao
  ) then
    insert into public.templates_competencia (nome, eh_padrao)
    values ('Template Padrão 360°', true)
    returning id into v_template_id;

    insert into public.perguntas_template (
      template_id,
      competencia,
      descricao_niveis,
      ordem
    )
    values
      (
        v_template_id,
        'Comunicação',
        'Clareza, objetividade e assertividade na troca de informações com a equipe.',
        0
      ),
      (
        v_template_id,
        'Colaboração',
        'Disponibilidade para apoiar colegas, trabalho em equipe e espírito colaborativo.',
        1
      ),
      (
        v_template_id,
        'Qualidade das Entregas',
        'Precisão, atenção a detalhes e nível de excelência nos resultados entregues.',
        2
      ),
      (
        v_template_id,
        'Postura Profissional',
        'Comprometimento, ética, proatividade e resiliência em situações de pressão.',
        3
      ),
      (
        v_template_id,
        'Qualidade Técnica',
        'Domínio de ferramentas, aplicação de boas práticas e eficiência na resolução de problemas.',
        4
      );
  end if;
end;
$$;

create or replace function public.proteger_template_competencia()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.eh_padrao then
    raise exception using
      errcode = 'P0001',
      message = 'DEFAULT_TEMPLATE_PROTECTED';
  end if;

  if exists (
    select 1
    from public.ciclos_avaliacao as ciclo
    where ciclo.template_id = old.id
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'TEMPLATE_IN_USE';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_template_competencia_mutacao
  on public.templates_competencia;
create trigger proteger_template_competencia_mutacao
  before update or delete on public.templates_competencia
  for each row execute function public.proteger_template_competencia();

create or replace function public.proteger_pergunta_template()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_template_ids uuid[];
begin
  v_template_ids := case
    when tg_op = 'INSERT' then array[new.template_id]
    when tg_op = 'DELETE' then array[old.template_id]
    else array[old.template_id, new.template_id]
  end;

  if exists (
    select 1
    from public.templates_competencia as template
    where template.id = any(v_template_ids)
      and template.eh_padrao
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEFAULT_TEMPLATE_PROTECTED';
  end if;

  if exists (
    select 1
    from public.ciclos_avaliacao as ciclo
    where ciclo.template_id = any(v_template_ids)
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'TEMPLATE_IN_USE';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_pergunta_template_mutacao
  on public.perguntas_template;
create trigger proteger_pergunta_template_mutacao
  before insert or update or delete on public.perguntas_template
  for each row execute function public.proteger_pergunta_template();

create or replace function public.salvar_template_competencia(
  p_template_id uuid,
  p_nome text,
  p_competencias jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_template_id uuid;
  v_eh_padrao boolean;
begin
  if not coalesce((select public.meu_papel()) in ('admin', 'rh'), false) then
    raise exception using
      errcode = '42501',
      message = 'TEMPLATE_PERMISSION_DENIED';
  end if;

  if nullif(btrim(p_nome), '') is null then
    raise exception using
      errcode = '22023',
      message = 'TEMPLATE_NAME_REQUIRED';
  end if;

  if p_competencias is null
    or jsonb_typeof(p_competencias) <> 'array'
    or jsonb_array_length(p_competencias) = 0 then
    raise exception using
      errcode = '22023',
      message = 'TEMPLATE_COMPETENCIES_REQUIRED';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_competencias) with ordinality as item(value, position)
    where jsonb_typeof(item.value) <> 'object'
      or nullif(btrim(item.value ->> 'nome'), '') is null
      or nullif(btrim(item.value ->> 'descricao'), '') is null
      or coalesce(item.value ->> 'ordem', '') !~ '^[0-9]+$'
      or (item.value ->> 'ordem')::integer <> item.position - 1
  ) then
    raise exception using
      errcode = '22023',
      message = 'TEMPLATE_COMPETENCIES_INVALID';
  end if;

  if p_template_id is null then
    insert into public.templates_competencia (nome, eh_padrao)
    values (btrim(p_nome), false)
    returning id into v_template_id;
  else
    select template.id, template.eh_padrao
      into v_template_id, v_eh_padrao
    from public.templates_competencia as template
    where template.id = p_template_id
    for update;

    if not found then
      raise exception using
        errcode = 'P0002',
        message = 'TEMPLATE_NOT_FOUND';
    end if;

    if v_eh_padrao then
      raise exception using
        errcode = 'P0001',
        message = 'DEFAULT_TEMPLATE_PROTECTED';
    end if;

    if exists (
      select 1
      from public.ciclos_avaliacao as ciclo
      where ciclo.template_id = v_template_id
    ) then
      raise exception using
        errcode = 'P0001',
        message = 'TEMPLATE_IN_USE';
    end if;

    update public.templates_competencia
    set nome = btrim(p_nome)
    where id = v_template_id;

    delete from public.perguntas_template
    where template_id = v_template_id;
  end if;

  insert into public.perguntas_template (
    template_id,
    competencia,
    descricao_niveis,
    ordem
  )
  select
    v_template_id,
    btrim(item.value ->> 'nome'),
    btrim(item.value ->> 'descricao'),
    (item.value ->> 'ordem')::integer
  from jsonb_array_elements(p_competencias) with ordinality as item(value, position)
  order by item.position;

  return v_template_id;
end;
$$;

revoke all on function public.proteger_template_competencia() from public, anon, authenticated;
revoke all on function public.proteger_pergunta_template() from public, anon, authenticated;
revoke all on function public.salvar_template_competencia(uuid, text, jsonb) from public, anon;
grant execute on function public.salvar_template_competencia(uuid, text, jsonb) to authenticated;
