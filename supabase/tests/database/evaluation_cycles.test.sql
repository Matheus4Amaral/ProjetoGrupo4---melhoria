begin;

create extension if not exists pgtap with schema extensions;

select plan(21);

insert into auth.users (id, email)
values
  ('10000000-0000-4000-8000-000000000001', 'cycle-admin@example.com'),
  ('10000000-0000-4000-8000-000000000002', 'cycle-rh@example.com'),
  ('10000000-0000-4000-8000-000000000003', 'cycle-manager@example.com'),
  ('10000000-0000-4000-8000-000000000004', 'cycle-report@example.com'),
  ('10000000-0000-4000-8000-000000000005', 'cycle-peer@example.com'),
  ('10000000-0000-4000-8000-000000000006', 'cycle-isolated@example.com'),
  ('10000000-0000-4000-8000-000000000007', 'cycle-inactive@example.com');

update public.perfis
set
  nome_completo = case id
    when '10000000-0000-4000-8000-000000000001' then 'Admin de Ciclos'
    when '10000000-0000-4000-8000-000000000002' then 'RH de Ciclos'
    when '10000000-0000-4000-8000-000000000003' then 'Gestor'
    when '10000000-0000-4000-8000-000000000004' then 'Liderado'
    when '10000000-0000-4000-8000-000000000005' then 'Par'
    when '10000000-0000-4000-8000-000000000006' then 'Isolado'
    else 'Inativo'
  end,
  papel = case
    when id = '10000000-0000-4000-8000-000000000001' then 'admin'::public.papel_perfil
    when id = '10000000-0000-4000-8000-000000000002' then 'rh'::public.papel_perfil
    else 'colaborador'::public.papel_perfil
  end,
  ativo = id <> '10000000-0000-4000-8000-000000000007'
where id::text like '10000000-0000-4000-8000-00000000000%';

update public.perfis
set gestor_id = '10000000-0000-4000-8000-000000000003'
where id = '10000000-0000-4000-8000-000000000004';

insert into public.templates_competencia (id, nome)
values ('20000000-0000-4000-8000-000000000001', 'Template de teste');

insert into public.times (id, nome)
values
  ('30000000-0000-4000-8000-000000000001', 'Time A'),
  ('30000000-0000-4000-8000-000000000002', 'Time B'),
  ('30000000-0000-4000-8000-000000000003', 'Time Isolado'),
  ('30000000-0000-4000-8000-000000000004', 'Time Vazio');

insert into public.membros_time (time_id, perfil_id)
values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003'),
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000004'),
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005'),
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000007'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000004'),
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000006');

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

select lives_ok(
  $$select public.salvar_ciclo_avaliacao(
    'Ciclo salvo',
    '20000000-0000-4000-8000-000000000001',
    '2026-08-01',
    '2026-08-31 23:59:59.999-03',
    array[
      '30000000-0000-4000-8000-000000000001'::uuid,
      '30000000-0000-4000-8000-000000000001'::uuid
    ]
  )$$,
  'admin cria ciclo e o array repetido de times é deduplicado'
);

select is(
  (select count(*) from public.ciclos_times where ciclo_id = (
    select id from public.ciclos_avaliacao where nome = 'Ciclo salvo'
  )),
  1::bigint,
  'ciclo salvo possui um único vínculo por time'
);

select throws_ok(
  $$select public.salvar_ciclo_avaliacao(
    'Sem times',
    '20000000-0000-4000-8000-000000000001',
    '2026-08-01',
    '2026-08-31 23:59:59.999-03',
    array[]::uuid[]
  )$$,
  '22023',
  'CYCLE_REQUIRES_TEAMS',
  'salvamento exige ao menos um time'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000005', true);
select throws_ok(
  $$select public.salvar_ciclo_avaliacao(
    'Sem permissão',
    '20000000-0000-4000-8000-000000000001',
    '2026-08-01',
    '2026-08-31 23:59:59.999-03',
    array['30000000-0000-4000-8000-000000000001'::uuid]
  )$$,
  '42501',
  'CYCLE_PERMISSION_DENIED',
  'colaborador não salva ciclo'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

insert into public.ciclos_avaliacao (id, nome, template_id, data_inicio, data_limite)
values
  ('40000000-0000-4000-8000-000000000001', 'Ciclo válido', '20000000-0000-4000-8000-000000000001', '2026-08-01', '2026-08-31 23:59:59.999-03'),
  ('40000000-0000-4000-8000-000000000002', 'Ciclo sem time', '20000000-0000-4000-8000-000000000001', '2026-08-01', '2026-08-31 23:59:59.999-03'),
  ('40000000-0000-4000-8000-000000000003', 'Ciclo time vazio', '20000000-0000-4000-8000-000000000001', '2026-08-01', '2026-08-31 23:59:59.999-03'),
  ('40000000-0000-4000-8000-000000000004', 'Ciclo rollback', '20000000-0000-4000-8000-000000000001', '2026-08-01', '2026-08-31 23:59:59.999-03');

insert into public.ciclos_times (ciclo_id, time_id)
values
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001'),
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002'),
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003'),
  ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000004'),
  ('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000001');

select throws_ok(
  $$select public.gerar_atribuicoes_ciclo('40000000-0000-4000-8000-000000000002')$$,
  '22023',
  'CYCLE_REQUIRES_TEAMS',
  'geração bloqueia ciclo sem times'
);

select throws_matching(
  $$select public.gerar_atribuicoes_ciclo('40000000-0000-4000-8000-000000000003')$$,
  'CYCLE_TEAM_WITHOUT_ACTIVE_MEMBERS: Time Vazio',
  'geração identifica time sem membro ativo'
);

create function pg_temp.falhar_pares_teste()
returns trigger
language plpgsql
as $$
begin
  if new.ciclo_id = '40000000-0000-4000-8000-000000000004'
    and new.avaliador_id <> new.avaliado_id then
    raise exception 'TEST_PAIR_FAILURE';
  end if;
  return new;
end;
$$;

create trigger falhar_pares_teste_trigger
  before insert on public.atribuicoes_avaliacao
  for each row execute function pg_temp.falhar_pares_teste();

select throws_matching(
  $$select public.gerar_atribuicoes_ciclo('40000000-0000-4000-8000-000000000004')$$,
  'TEST_PAIR_FAILURE',
  'falha após autoavaliações aborta a geração'
);

select results_eq(
  $$select status::text, count(atribuicao.id)
    from public.ciclos_avaliacao as ciclo
    left join public.atribuicoes_avaliacao as atribuicao on atribuicao.ciclo_id = ciclo.id
    where ciclo.id = '40000000-0000-4000-8000-000000000004'
    group by ciclo.status$$,
  $$values ('draft'::text, 0::bigint)$$,
  'rollback remove autoavaliações parciais e mantém draft'
);

drop trigger falhar_pares_teste_trigger on public.atribuicoes_avaliacao;

select lives_ok(
  $$select public.gerar_atribuicoes_ciclo('40000000-0000-4000-8000-000000000001')$$,
  'geração válida conclui'
);

select is(
  (select status::text from public.ciclos_avaliacao where id = '40000000-0000-4000-8000-000000000001'),
  'active',
  'geração abre o ciclo'
);

select is(
  (select count(*) from public.atribuicoes_avaliacao where ciclo_id = '40000000-0000-4000-8000-000000000001'),
  10::bigint,
  'snapshot contém autoavaliações e pares sem duplicar times sobrepostos'
);

select is(
  (select count(*) from public.atribuicoes_avaliacao
   where ciclo_id = '40000000-0000-4000-8000-000000000001'
     and avaliador_id = '10000000-0000-4000-8000-000000000007'),
  0::bigint,
  'perfil inativo não recebe atribuições'
);

select is(
  (select tipo_relacionamento::text from public.atribuicoes_avaliacao
   where ciclo_id = '40000000-0000-4000-8000-000000000001'
     and avaliador_id = '10000000-0000-4000-8000-000000000003'
     and avaliado_id = '10000000-0000-4000-8000-000000000004'),
  'gestor',
  'gestor prevalece sobre pares'
);

select is(
  (select tipo_relacionamento::text from public.atribuicoes_avaliacao
   where ciclo_id = '40000000-0000-4000-8000-000000000001'
     and avaliador_id = '10000000-0000-4000-8000-000000000004'
     and avaliado_id = '10000000-0000-4000-8000-000000000003'),
  'subordinado',
  'liderado avalia gestor como subordinado'
);

select is(
  (select count(*) from public.atribuicoes_avaliacao
   where ciclo_id = '40000000-0000-4000-8000-000000000001'
     and (
       (avaliador_id = '10000000-0000-4000-8000-000000000006' and avaliado_id <> avaliador_id)
       or (avaliado_id = '10000000-0000-4000-8000-000000000006' and avaliador_id <> avaliado_id)
     )),
  0::bigint,
  'membro de time isolado não é pareado com outros times'
);

select throws_ok(
  $$select public.gerar_atribuicoes_ciclo('40000000-0000-4000-8000-000000000001')$$,
  '55000',
  'CYCLE_NOT_DRAFT',
  'repetição segura rejeita ciclo já aberto'
);

select throws_ok(
  $$delete from public.ciclos_times where ciclo_id = '40000000-0000-4000-8000-000000000001'$$,
  '55000',
  'CYCLE_SCOPE_IMMUTABLE',
  'escopo aberto é imutável'
);

delete from public.membros_time
where time_id = '30000000-0000-4000-8000-000000000001'
  and perfil_id = '10000000-0000-4000-8000-000000000005';
update public.perfis
set gestor_id = null
where id = '10000000-0000-4000-8000-000000000004';

select is(
  (select count(*) from public.atribuicoes_avaliacao where ciclo_id = '40000000-0000-4000-8000-000000000001'),
  10::bigint,
  'snapshot não muda após alterações organizacionais'
);

select col_is_unique(
  'public',
  'atribuicoes_avaliacao',
  array['ciclo_id', 'avaliador_id', 'avaliado_id'],
  'unicidade protege gerações concorrentes contra duplicação'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000005', true);
set local role authenticated;

select throws_ok(
  $$insert into public.ciclos_times (ciclo_id, time_id)
    values ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001')$$,
  '42501',
  null,
  'RLS impede colaborador de alterar escopo'
);

reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

select is(
  (select count(*) from public.listar_ciclos_avaliacao() where id = '40000000-0000-4000-8000-000000000001'),
  1::bigint,
  'listagem agregada retorna o ciclo sem expor linhas de atribuição'
);

select * from finish();
rollback;
