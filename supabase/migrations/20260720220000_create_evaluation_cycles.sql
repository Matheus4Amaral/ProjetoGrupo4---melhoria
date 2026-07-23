-- Persistent evaluation-cycle configuration and atomic assignment generation.

create table public.ciclos_times (
  id uuid not null default gen_random_uuid(),
  ciclo_id uuid not null,
  time_id uuid not null,
  criado_em timestamptz not null default now(),
  constraint ciclos_times_pkey primary key (id),
  constraint ciclos_times_ciclo_id_fkey foreign key (ciclo_id)
    references public.ciclos_avaliacao (id) on delete cascade,
  constraint ciclos_times_time_id_fkey foreign key (time_id)
    references public.times (id) on delete restrict,
  constraint ciclos_times_ciclo_time_key unique (ciclo_id, time_id)
);

create index ciclos_times_time_id_idx on public.ciclos_times (time_id);
create index membros_time_time_perfil_idx on public.membros_time (time_id, perfil_id);
create index atribuicoes_avaliacao_ciclo_status_idx
  on public.atribuicoes_avaliacao (ciclo_id, status);

-- The canonical schema already defines atribuicoes_avaliacao_unica_key. Keep an
-- idempotent guard for installations created from an older snapshot.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.atribuicoes_avaliacao'::regclass
      and conname = 'atribuicoes_avaliacao_unica_key'
  ) then
    alter table public.atribuicoes_avaliacao
      add constraint atribuicoes_avaliacao_unica_key
      unique (ciclo_id, avaliador_id, avaliado_id);
  end if;
end;
$$;

create or replace function public.proteger_escopo_ciclo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ciclo_id uuid;
  v_status public.status_ciclo;
begin
  v_ciclo_id := case when tg_op = 'DELETE' then old.ciclo_id else new.ciclo_id end;

  select ciclo.status
    into v_status
  from public.ciclos_avaliacao as ciclo
  where ciclo.id = v_ciclo_id;

  if not found and tg_op = 'DELETE' then
    return old;
  end if;

  if v_status is distinct from 'draft'::public.status_ciclo then
    raise exception using
      errcode = '55000',
      message = 'CYCLE_SCOPE_IMMUTABLE';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger proteger_escopo_ciclo_trigger
  before insert or update or delete on public.ciclos_times
  for each row execute function public.proteger_escopo_ciclo();

alter table public.ciclos_times enable row level security;

grant select, insert, delete on public.ciclos_times to authenticated;
grant all on public.ciclos_times to service_role;

create policy ciclos_times_select_authenticated on public.ciclos_times
  for select to authenticated using (true);

create policy ciclos_times_insert_admin_rh_draft on public.ciclos_times
  for insert to authenticated
  with check (
    (select public.meu_papel()) in ('admin', 'rh')
    and exists (
      select 1
      from public.ciclos_avaliacao as ciclo
      where ciclo.id = ciclo_id
        and ciclo.status = 'draft'
    )
  );

create policy ciclos_times_delete_admin_rh_draft on public.ciclos_times
  for delete to authenticated
  using (
    (select public.meu_papel()) in ('admin', 'rh')
    and exists (
      select 1
      from public.ciclos_avaliacao as ciclo
      where ciclo.id = ciclo_id
        and ciclo.status = 'draft'
    )
  );

create or replace function public.salvar_ciclo_avaliacao(
  p_nome text,
  p_template_id uuid,
  p_data_inicio date,
  p_data_limite timestamptz,
  p_time_ids uuid[],
  p_ciclo_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ciclo public.ciclos_avaliacao%rowtype;
  v_time_ids uuid[];
  v_requested_count integer;
  v_existing_count integer;
begin
  if (select public.meu_papel()) not in ('admin', 'rh') then
    raise exception using errcode = '42501', message = 'CYCLE_PERMISSION_DENIED';
  end if;

  if nullif(btrim(p_nome), '') is null
    or p_template_id is null
    or p_data_inicio is null
    or p_data_limite is null then
    raise exception using errcode = '22023', message = 'CYCLE_INVALID_CONFIGURATION';
  end if;

  if (p_data_limite at time zone 'America/Sao_Paulo')::date < p_data_inicio then
    raise exception using errcode = '22023', message = 'CYCLE_INVALID_DATE_RANGE';
  end if;

  select array_agg(distinct requested_time_id order by requested_time_id)
    into v_time_ids
  from unnest(coalesce(p_time_ids, array[]::uuid[])) as requested(requested_time_id)
  where requested_time_id is not null;

  if coalesce(cardinality(v_time_ids), 0) = 0 then
    raise exception using errcode = '22023', message = 'CYCLE_REQUIRES_TEAMS';
  end if;

  if not exists (
    select 1
    from public.templates_competencia as template
    where template.id = p_template_id
  ) then
    raise exception using errcode = '23503', message = 'CYCLE_TEMPLATE_NOT_FOUND';
  end if;

  v_requested_count := cardinality(v_time_ids);
  select count(*)
    into v_existing_count
  from public.times as team
  where team.id = any(v_time_ids);

  if v_existing_count <> v_requested_count then
    raise exception using errcode = '23503', message = 'CYCLE_TEAM_NOT_FOUND';
  end if;

  if p_ciclo_id is null then
    insert into public.ciclos_avaliacao (
      nome,
      template_id,
      status,
      data_inicio,
      data_limite
    )
    values (
      btrim(p_nome),
      p_template_id,
      'draft',
      p_data_inicio,
      p_data_limite
    )
    returning * into v_ciclo;
  else
    select ciclo.*
      into v_ciclo
    from public.ciclos_avaliacao as ciclo
    where ciclo.id = p_ciclo_id
    for update;

    if not found then
      raise exception using errcode = 'P0002', message = 'CYCLE_NOT_FOUND';
    end if;

    if v_ciclo.status <> 'draft' then
      raise exception using errcode = '55000', message = 'CYCLE_NOT_DRAFT';
    end if;

    update public.ciclos_avaliacao as ciclo
    set
      nome = btrim(p_nome),
      template_id = p_template_id,
      data_inicio = p_data_inicio,
      data_limite = p_data_limite
    where ciclo.id = p_ciclo_id
    returning ciclo.* into v_ciclo;

    delete from public.ciclos_times as ciclo_time
    where ciclo_time.ciclo_id = p_ciclo_id;
  end if;

  insert into public.ciclos_times (ciclo_id, time_id)
  select v_ciclo.id, requested_time_id
  from unnest(v_time_ids) as requested(requested_time_id);

  return jsonb_build_object('id', v_ciclo.id, 'status', v_ciclo.status);
end;
$$;

create or replace function public.listar_ciclos_avaliacao()
returns table (
  id uuid,
  nome text,
  template_id uuid,
  template_nome text,
  status public.status_ciclo,
  data_inicio date,
  data_limite timestamptz,
  criado_em timestamptz,
  times jsonb,
  total_atribuicoes bigint,
  atribuicoes_concluidas bigint
)
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  if (select public.meu_papel()) not in ('admin', 'rh') then
    raise exception using errcode = '42501', message = 'CYCLE_PERMISSION_DENIED';
  end if;

  return query
  select
    ciclo.id,
    ciclo.nome::text,
    ciclo.template_id,
    template.nome::text,
    ciclo.status,
    ciclo.data_inicio,
    ciclo.data_limite,
    ciclo.criado_em,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('id', team.id, 'nome', team.nome)
          order by team.nome
        )
        from public.ciclos_times as ciclo_time
        join public.times as team on team.id = ciclo_time.time_id
        where ciclo_time.ciclo_id = ciclo.id
      ),
      '[]'::jsonb
    ) as times,
    (
      select count(*)
      from public.atribuicoes_avaliacao as atribuicao
      where atribuicao.ciclo_id = ciclo.id
    ) as total_atribuicoes,
    (
      select count(*)
      from public.atribuicoes_avaliacao as atribuicao
      where atribuicao.ciclo_id = ciclo.id
        and atribuicao.status = 'completed'
    ) as atribuicoes_concluidas
  from public.ciclos_avaliacao as ciclo
  join public.templates_competencia as template on template.id = ciclo.template_id
  order by ciclo.criado_em desc, ciclo.id;
end;
$$;

create or replace function public.gerar_atribuicoes_ciclo(p_ciclo_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ciclo public.ciclos_avaliacao%rowtype;
  v_times_sem_membros text;
  v_total bigint;
begin
  if (select public.meu_papel()) not in ('admin', 'rh') then
    raise exception using errcode = '42501', message = 'CYCLE_PERMISSION_DENIED';
  end if;

  if p_ciclo_id is null then
    raise exception using errcode = '22023', message = 'CYCLE_ID_REQUIRED';
  end if;

  select ciclo.*
    into v_ciclo
  from public.ciclos_avaliacao as ciclo
  where ciclo.id = p_ciclo_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'CYCLE_NOT_FOUND';
  end if;

  if v_ciclo.status <> 'draft' then
    raise exception using errcode = '55000', message = 'CYCLE_NOT_DRAFT';
  end if;

  if (v_ciclo.data_limite at time zone 'America/Sao_Paulo')::date < v_ciclo.data_inicio then
    raise exception using errcode = '22023', message = 'CYCLE_INVALID_DATE_RANGE';
  end if;

  if not exists (
    select 1
    from public.ciclos_times as ciclo_time
    where ciclo_time.ciclo_id = p_ciclo_id
  ) then
    raise exception using errcode = '22023', message = 'CYCLE_REQUIRES_TEAMS';
  end if;

  select string_agg(team.nome, ', ' order by team.nome)
    into v_times_sem_membros
  from public.ciclos_times as ciclo_time
  join public.times as team on team.id = ciclo_time.time_id
  where ciclo_time.ciclo_id = p_ciclo_id
    and not exists (
      select 1
      from public.membros_time as membro
      join public.perfis as perfil
        on perfil.id = membro.perfil_id
       and perfil.ativo
      where membro.time_id = ciclo_time.time_id
    );

  if v_times_sem_membros is not null then
    raise exception using
      errcode = '22023',
      message = 'CYCLE_TEAM_WITHOUT_ACTIVE_MEMBERS: ' || v_times_sem_membros;
  end if;

  if exists (
    select 1
    from public.atribuicoes_avaliacao as atribuicao
    where atribuicao.ciclo_id = p_ciclo_id
  ) then
    raise exception using errcode = '55000', message = 'CYCLE_ASSIGNMENTS_EXIST';
  end if;

  with participantes as (
    select distinct membro.perfil_id
    from public.ciclos_times as ciclo_time
    join public.membros_time as membro on membro.time_id = ciclo_time.time_id
    join public.perfis as perfil
      on perfil.id = membro.perfil_id
     and perfil.ativo
    where ciclo_time.ciclo_id = p_ciclo_id
  )
  insert into public.atribuicoes_avaliacao (
    ciclo_id,
    avaliador_id,
    avaliado_id,
    tipo_relacionamento
  )
  select
    p_ciclo_id,
    participante.perfil_id,
    participante.perfil_id,
    'autoavaliacao'::public.tipo_relacionamento
  from participantes as participante;

  with membros_selecionados as (
    select distinct ciclo_time.time_id, membro.perfil_id
    from public.ciclos_times as ciclo_time
    join public.membros_time as membro on membro.time_id = ciclo_time.time_id
    join public.perfis as perfil
      on perfil.id = membro.perfil_id
     and perfil.ativo
    where ciclo_time.ciclo_id = p_ciclo_id
  ),
  pares_ordenados as (
    select distinct
      avaliador.perfil_id as avaliador_id,
      avaliado.perfil_id as avaliado_id
    from membros_selecionados as avaliador
    join membros_selecionados as avaliado
      on avaliado.time_id = avaliador.time_id
     and avaliado.perfil_id <> avaliador.perfil_id
  )
  insert into public.atribuicoes_avaliacao (
    ciclo_id,
    avaliador_id,
    avaliado_id,
    tipo_relacionamento
  )
  select
    p_ciclo_id,
    par.avaliador_id,
    par.avaliado_id,
    case
      when perfil_avaliado.gestor_id = par.avaliador_id
        then 'gestor'::public.tipo_relacionamento
      when perfil_avaliador.gestor_id = par.avaliado_id
        then 'subordinado'::public.tipo_relacionamento
      else 'pares'::public.tipo_relacionamento
    end
  from pares_ordenados as par
  join public.perfis as perfil_avaliador on perfil_avaliador.id = par.avaliador_id
  join public.perfis as perfil_avaliado on perfil_avaliado.id = par.avaliado_id;

  update public.ciclos_avaliacao as ciclo
  set status = 'active'
  where ciclo.id = p_ciclo_id;

  select count(*)
    into v_total
  from public.atribuicoes_avaliacao as atribuicao
  where atribuicao.ciclo_id = p_ciclo_id;

  return jsonb_build_object(
    'cicloId', p_ciclo_id,
    'status', 'active',
    'totalAtribuicoes', v_total
  );
end;
$$;

revoke all on function public.proteger_escopo_ciclo() from public, anon, authenticated;
revoke all on function public.salvar_ciclo_avaliacao(text, uuid, date, timestamptz, uuid[], uuid) from public, anon;
revoke all on function public.listar_ciclos_avaliacao() from public, anon;
revoke all on function public.gerar_atribuicoes_ciclo(uuid) from public, anon;

grant execute on function public.salvar_ciclo_avaliacao(text, uuid, date, timestamptz, uuid[], uuid) to authenticated;
grant execute on function public.listar_ciclos_avaliacao() to authenticated;
grant execute on function public.gerar_atribuicoes_ciclo(uuid) to authenticated;
