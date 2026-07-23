-- Secure collaborator evaluation workflow, cycle closure and anonymous results.

create or replace function public.validar_atribuicao_editavel(p_atribuicao_id uuid)
returns public.atribuicoes_avaliacao
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_atribuicao public.atribuicoes_avaliacao%rowtype;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'EVALUATION_AUTH_REQUIRED';
  end if;

  select atribuicao.* into v_atribuicao
  from public.atribuicoes_avaliacao as atribuicao
  join public.ciclos_avaliacao as ciclo on ciclo.id = atribuicao.ciclo_id
  where atribuicao.id = p_atribuicao_id
  for update of atribuicao;

  if not found then
    raise exception using errcode = 'P0002', message = 'EVALUATION_NOT_FOUND';
  end if;
  if v_atribuicao.avaliador_id <> auth.uid() then
    raise exception using errcode = '42501', message = 'EVALUATION_PERMISSION_DENIED';
  end if;
  if v_atribuicao.status = 'completed' then
    raise exception using errcode = '55000', message = 'EVALUATION_COMPLETED';
  end if;
  if not exists (
    select 1 from public.ciclos_avaliacao as ciclo
    where ciclo.id = v_atribuicao.ciclo_id
      and ciclo.status = 'active'
      and current_date >= ciclo.data_inicio
      and now() <= ciclo.data_limite
  ) then
    raise exception using errcode = '55000', message = 'EVALUATION_PERIOD_CLOSED';
  end if;
  return v_atribuicao;
end;
$$;

create or replace function public.listar_ciclos_avaliador()
returns table (
  ciclo_id uuid, nome text, data_inicio date, data_limite timestamptz,
  disponivel boolean, autoavaliacao jsonb, pendentes_terceiros bigint, atribuicoes jsonb
)
language sql
security definer
stable
set search_path = ''
as $$
  select ciclo.id, ciclo.nome::text, ciclo.data_inicio, ciclo.data_limite,
    (ciclo.status = 'active' and current_date >= ciclo.data_inicio and now() <= ciclo.data_limite),
    coalesce((
      select jsonb_build_object('id', a.id, 'status', a.status)
      from public.atribuicoes_avaliacao a
      where a.ciclo_id = ciclo.id and a.avaliador_id = auth.uid()
        and a.tipo_relacionamento = 'autoavaliacao'
    ), 'null'::jsonb),
    count(*) filter (where atribuicao.avaliado_id <> auth.uid() and atribuicao.status <> 'completed'),
    coalesce(jsonb_agg(
      jsonb_build_object(
        'id', atribuicao.id,
        'avaliadoNome', perfil.nome_completo,
        'status', atribuicao.status,
        'autoavaliacao', atribuicao.tipo_relacionamento = 'autoavaliacao'
      ) order by (atribuicao.tipo_relacionamento = 'autoavaliacao') desc, perfil.nome_completo
    ) filter (where atribuicao.status <> 'completed'), '[]'::jsonb)
  from public.ciclos_avaliacao ciclo
  join public.atribuicoes_avaliacao atribuicao
    on atribuicao.ciclo_id = ciclo.id and atribuicao.avaliador_id = auth.uid()
  join public.perfis perfil on perfil.id = atribuicao.avaliado_id
  where ciclo.status = 'active'
  group by ciclo.id
  order by ciclo.data_limite, ciclo.id;
$$;

create or replace function public.obter_atribuicao_avaliacao(p_atribuicao_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare v_result jsonb;
begin
  select jsonb_build_object(
    'id', a.id, 'cicloId', c.id, 'cicloNome', c.nome, 'dataLimite', c.data_limite,
    'status', a.status, 'avaliadoNome', p.nome_completo,
    'autoavaliacao', a.tipo_relacionamento = 'autoavaliacao',
    'perguntas', coalesce((select jsonb_agg(jsonb_build_object(
      'id', q.id, 'competencia', q.competencia, 'descricaoNiveis', q.descricao_niveis,
      'ordem', q.ordem, 'nota', r.nota
    ) order by q.ordem, q.id)
      from public.perguntas_template q
      left join public.respostas_avaliacao r
        on r.pergunta_id = q.id and r.atribuicao_id = a.id
      where q.template_id = c.template_id), '[]'::jsonb),
    'pontosFortes', f.pontos_fortes, 'pontosMelhoria', f.pontos_melhoria
  ) into v_result
  from public.atribuicoes_avaliacao a
  join public.ciclos_avaliacao c on c.id = a.ciclo_id
  join public.perfis p on p.id = a.avaliado_id
  left join public.feedback_aberto_avaliacao f on f.atribuicao_id = a.id
  where a.id = p_atribuicao_id and a.avaliador_id = auth.uid()
    and c.status = 'active';
  if v_result is null then
    raise exception using errcode = 'P0002', message = 'EVALUATION_NOT_FOUND';
  end if;
  return v_result;
end;
$$;

create or replace function public.salvar_rascunho_avaliacao(
  p_atribuicao_id uuid, p_respostas jsonb,
  p_pontos_fortes text default null, p_pontos_melhoria text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_atribuicao public.atribuicoes_avaliacao%rowtype;
begin
  v_atribuicao := public.validar_atribuicao_editavel(p_atribuicao_id);
  if jsonb_typeof(coalesce(p_respostas, '[]'::jsonb)) <> 'array' then
    raise exception using errcode = '22023', message = 'EVALUATION_INVALID_ANSWERS';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(coalesce(p_respostas, '[]'::jsonb)) as x(pergunta_id uuid, nota integer)
    left join public.perguntas_template q on q.id = x.pergunta_id
    join public.ciclos_avaliacao c on c.id = v_atribuicao.ciclo_id
    where q.id is null or q.template_id <> c.template_id or x.nota not between 1 and 5
  ) then
    raise exception using errcode = '22023', message = 'EVALUATION_INVALID_ANSWERS';
  end if;
  insert into public.respostas_avaliacao (atribuicao_id, pergunta_id, nota)
  select p_atribuicao_id, x.pergunta_id, x.nota
  from jsonb_to_recordset(coalesce(p_respostas, '[]'::jsonb)) as x(pergunta_id uuid, nota integer)
  on conflict (atribuicao_id, pergunta_id) do update set nota = excluded.nota;
  insert into public.feedback_aberto_avaliacao (atribuicao_id, pontos_fortes, pontos_melhoria)
  values (p_atribuicao_id, nullif(btrim(p_pontos_fortes), ''), nullif(btrim(p_pontos_melhoria), ''))
  on conflict (atribuicao_id) do update set
    pontos_fortes = excluded.pontos_fortes, pontos_melhoria = excluded.pontos_melhoria;
  update public.atribuicoes_avaliacao set status = 'in_progress'
  where id = p_atribuicao_id and status = 'pending';
  return jsonb_build_object('id', p_atribuicao_id, 'status', 'in_progress');
end;
$$;

create or replace function public.finalizar_avaliacao(
  p_atribuicao_id uuid, p_respostas jsonb,
  p_pontos_fortes text default null, p_pontos_melhoria text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_atribuicao public.atribuicoes_avaliacao%rowtype; v_total integer; v_enviadas integer;
begin
  v_atribuicao := public.validar_atribuicao_editavel(p_atribuicao_id);
  perform public.salvar_rascunho_avaliacao(p_atribuicao_id, p_respostas, p_pontos_fortes, p_pontos_melhoria);
  select count(*) into v_total from public.perguntas_template q
  join public.ciclos_avaliacao c on c.template_id = q.template_id
  where c.id = v_atribuicao.ciclo_id;
  select count(*) into v_enviadas from public.respostas_avaliacao r
  join public.perguntas_template q on q.id = r.pergunta_id
  join public.ciclos_avaliacao c on c.template_id = q.template_id
  where r.atribuicao_id = p_atribuicao_id and c.id = v_atribuicao.ciclo_id;
  if v_total = 0 or v_enviadas <> v_total then
    raise exception using errcode = '23514', message = 'EVALUATION_INCOMPLETE';
  end if;
  update public.atribuicoes_avaliacao set status = 'completed' where id = p_atribuicao_id;
  return jsonb_build_object('id', p_atribuicao_id, 'status', 'completed');
end;
$$;

create or replace function public.proteger_avaliacao_finalizada()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_status public.status_atribuicao; v_ciclo public.status_ciclo; v_limite timestamptz;
begin
  v_id := case when tg_table_name = 'atribuicoes_avaliacao' then old.id else coalesce(old.atribuicao_id, new.atribuicao_id) end;
  select a.status, c.status, c.data_limite into v_status, v_ciclo, v_limite
  from public.atribuicoes_avaliacao a join public.ciclos_avaliacao c on c.id = a.ciclo_id where a.id = v_id;
  if v_status = 'completed' or v_ciclo <> 'active' or now() > v_limite then
    raise exception using errcode = '55000', message = 'EVALUATION_IMMUTABLE';
  end if;
  return new;
end; $$;

create trigger proteger_respostas_finalizadas before insert or update or delete on public.respostas_avaliacao
for each row execute function public.proteger_avaliacao_finalizada();
create trigger proteger_feedback_finalizado before insert or update or delete on public.feedback_aberto_avaliacao
for each row execute function public.proteger_avaliacao_finalizada();
create trigger proteger_atribuicao_finalizada before update or delete on public.atribuicoes_avaliacao
for each row execute function public.proteger_avaliacao_finalizada();

create or replace function public.fechar_ciclo_interno(p_ciclo_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_status public.status_ciclo;
begin
  select status into v_status from public.ciclos_avaliacao where id = p_ciclo_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'CYCLE_NOT_FOUND'; end if;
  if v_status = 'draft' then raise exception using errcode = '55000', message = 'CYCLE_NOT_ACTIVE'; end if;
  if v_status = 'active' then
    update public.ciclos_avaliacao set status = 'closed' where id = p_ciclo_id;
  end if;
  return jsonb_build_object('id', p_ciclo_id, 'status', 'closed');
end; $$;

create or replace function public.fechar_ciclo_avaliacao(p_ciclo_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if (select public.meu_papel()) not in ('admin', 'rh') then
    raise exception using errcode = '42501', message = 'CYCLE_PERMISSION_DENIED';
  end if;
  return public.fechar_ciclo_interno(p_ciclo_id);
end; $$;

create or replace function public.fechar_ciclos_vencidos()
returns integer language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_count integer := 0;
begin
  for v_id in select id from public.ciclos_avaliacao where status = 'active' and data_limite <= now()
  loop perform public.fechar_ciclo_interno(v_id); v_count := v_count + 1; end loop;
  return v_count;
end; $$;

do $$
begin
  create extension if not exists pg_cron with schema extensions;
  if not exists (select 1 from cron.job where jobname = 'fechar-ciclos-avaliacao-vencidos') then
    perform cron.schedule('fechar-ciclos-avaliacao-vencidos', '*/15 * * * *', 'select public.fechar_ciclos_vencidos()');
  end if;
exception when others then
  raise notice 'pg_cron indisponivel; configure um agendamento externo para public.fechar_ciclos_vencidos()';
end; $$;

create or replace function public.listar_resultados_colaborador()
returns table (ciclo_id uuid, nome text, data_inicio date, data_limite timestamptz)
language sql security definer stable set search_path = '' as $$
  select c.id, c.nome::text, c.data_inicio, c.data_limite
  from public.ciclos_avaliacao c
  where c.status = 'closed' and exists (
    select 1 from public.atribuicoes_avaliacao a where a.ciclo_id = c.id and a.avaliado_id = auth.uid()
  ) order by c.data_limite desc, c.id;
$$;

create or replace function public.obter_resultado_colaborador(p_ciclo_id uuid)
returns jsonb language plpgsql security definer stable set search_path = '' as $$
declare v_result jsonb;
begin
  if not exists (select 1 from public.ciclos_avaliacao c where c.id = p_ciclo_id and c.status = 'closed')
    or not exists (select 1 from public.atribuicoes_avaliacao a where a.ciclo_id = p_ciclo_id and a.avaliado_id = auth.uid()) then
    raise exception using errcode = '42501', message = 'RESULT_PERMISSION_DENIED';
  end if;
  select jsonb_build_object(
    'mediaAutoavaliacao', (select round(avg(r.nota)::numeric, 2) from public.atribuicoes_avaliacao a join public.respostas_avaliacao r on r.atribuicao_id = a.id where a.ciclo_id = p_ciclo_id and a.avaliado_id = auth.uid() and a.status = 'completed' and a.tipo_relacionamento = 'autoavaliacao'),
    'mediaExterna', (select round(avg(r.nota)::numeric, 2) from public.atribuicoes_avaliacao a join public.respostas_avaliacao r on r.atribuicao_id = a.id where a.ciclo_id = p_ciclo_id and a.avaliado_id = auth.uid() and a.status = 'completed' and a.tipo_relacionamento <> 'autoavaliacao'),
    'feedbacks', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('pontosFortes', nullif(btrim(f.pontos_fortes), ''), 'pontosMelhoria', nullif(btrim(f.pontos_melhoria), '')))) from public.atribuicoes_avaliacao a join public.feedback_aberto_avaliacao f on f.atribuicao_id = a.id where a.ciclo_id = p_ciclo_id and a.avaliado_id = auth.uid() and a.status = 'completed' and a.tipo_relacionamento <> 'autoavaliacao' and (nullif(btrim(f.pontos_fortes), '') is not null or nullif(btrim(f.pontos_melhoria), '') is not null)), '[]'::jsonb)
  ) into v_result;
  return v_result;
end; $$;

drop policy if exists atribuicoes_select_envolvidos on public.atribuicoes_avaliacao;
create policy atribuicoes_select_proprio_avaliador_ou_admin on public.atribuicoes_avaliacao for select to authenticated
using (avaliador_id = auth.uid() or (select public.meu_papel()) in ('admin', 'rh'));
drop policy if exists respostas_select_envolvidos on public.respostas_avaliacao;
create policy respostas_select_proprio_avaliador_ou_admin on public.respostas_avaliacao for select to authenticated
using (exists (select 1 from public.atribuicoes_avaliacao a where a.id = atribuicao_id and (a.avaliador_id = auth.uid() or (select public.meu_papel()) in ('admin', 'rh'))));
drop policy if exists feedback_aberto_select_envolvidos on public.feedback_aberto_avaliacao;
create policy feedback_select_proprio_avaliador_ou_admin on public.feedback_aberto_avaliacao for select to authenticated
using (exists (select 1 from public.atribuicoes_avaliacao a where a.id = atribuicao_id and (a.avaliador_id = auth.uid() or (select public.meu_papel()) in ('admin', 'rh'))));

revoke all on function public.validar_atribuicao_editavel(uuid) from public, anon, authenticated;
revoke all on function public.fechar_ciclo_interno(uuid) from public, anon, authenticated;
revoke all on function public.fechar_ciclos_vencidos() from public, anon, authenticated;
revoke all on function public.listar_ciclos_avaliador() from public, anon;
revoke all on function public.obter_atribuicao_avaliacao(uuid) from public, anon;
revoke all on function public.salvar_rascunho_avaliacao(uuid, jsonb, text, text) from public, anon;
revoke all on function public.finalizar_avaliacao(uuid, jsonb, text, text) from public, anon;
revoke all on function public.fechar_ciclo_avaliacao(uuid) from public, anon;
revoke all on function public.listar_resultados_colaborador() from public, anon;
revoke all on function public.obter_resultado_colaborador(uuid) from public, anon;
grant execute on function public.listar_ciclos_avaliador() to authenticated;
grant execute on function public.obter_atribuicao_avaliacao(uuid) to authenticated;
grant execute on function public.salvar_rascunho_avaliacao(uuid, jsonb, text, text) to authenticated;
grant execute on function public.finalizar_avaliacao(uuid, jsonb, text, text) to authenticated;
grant execute on function public.fechar_ciclo_avaliacao(uuid) to authenticated;
grant execute on function public.listar_resultados_colaborador() to authenticated;
grant execute on function public.obter_resultado_colaborador(uuid) to authenticated;
