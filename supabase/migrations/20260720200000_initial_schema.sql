-- Initial schema for Avalia.ai.dev.
-- This migration is the canonical source of truth for the remote database.

create type public.papel_perfil as enum (
  'admin',
  'rh',
  'colaborador'
);

create type public.status_ciclo as enum (
  'draft',
  'active',
  'closed'
);

create type public.tipo_relacionamento as enum (
  'autoavaliacao',
  'gestor',
  'pares',
  'subordinado'
);

create type public.status_atribuicao as enum (
  'pending',
  'in_progress',
  'completed'
);

create table public.perfis (
  id uuid not null,
  nome_completo varchar not null,
  email varchar not null unique,
  papel public.papel_perfil not null default 'colaborador',
  gestor_id uuid,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  constraint perfis_pkey primary key (id),
  constraint perfis_auth_user_fkey foreign key (id)
    references auth.users (id) on delete cascade,
  constraint perfis_gestor_id_fkey foreign key (gestor_id)
    references public.perfis (id) on delete set null
);

create table public.times (
  id uuid not null default gen_random_uuid(),
  nome varchar not null check (nullif(btrim(nome), '') is not null),
  descricao text,
  criado_em timestamptz not null default now(),
  constraint times_pkey primary key (id)
);

create table public.membros_time (
  id uuid not null default gen_random_uuid(),
  time_id uuid not null,
  perfil_id uuid not null,
  criado_em timestamptz not null default now(),
  constraint membros_time_pkey primary key (id),
  constraint membros_time_perfil_id_fkey foreign key (perfil_id)
    references public.perfis (id) on delete cascade,
  constraint membros_time_time_id_fkey foreign key (time_id)
    references public.times (id) on delete cascade,
  constraint membros_time_time_perfil_key unique (time_id, perfil_id)
);

create table public.templates_competencia (
  id uuid not null default gen_random_uuid(),
  nome varchar not null,
  eh_padrao boolean not null default false,
  criado_em timestamptz not null default now(),
  constraint templates_competencia_pkey primary key (id)
);

create table public.perguntas_template (
  id uuid not null default gen_random_uuid(),
  template_id uuid not null,
  competencia varchar not null,
  descricao_niveis text,
  ordem integer not null default 0,
  criado_em timestamptz not null default now(),
  constraint perguntas_template_pkey primary key (id),
  constraint perguntas_template_template_id_fkey foreign key (template_id)
    references public.templates_competencia (id) on delete cascade
);

create table public.ciclos_avaliacao (
  id uuid not null default gen_random_uuid(),
  nome varchar not null,
  template_id uuid not null,
  status public.status_ciclo not null default 'draft',
  data_inicio date not null,
  data_limite timestamptz not null,
  criado_em timestamptz not null default now(),
  constraint ciclos_avaliacao_pkey primary key (id),
  constraint ciclos_avaliacao_template_id_fkey foreign key (template_id)
    references public.templates_competencia (id)
);

create table public.atribuicoes_avaliacao (
  id uuid not null default gen_random_uuid(),
  ciclo_id uuid not null,
  avaliador_id uuid not null,
  avaliado_id uuid not null,
  tipo_relacionamento public.tipo_relacionamento not null,
  status public.status_atribuicao not null default 'pending',
  criado_em timestamptz not null default now(),
  constraint atribuicoes_avaliacao_pkey primary key (id),
  constraint atribuicoes_avaliacao_ciclo_id_fkey foreign key (ciclo_id)
    references public.ciclos_avaliacao (id) on delete cascade,
  constraint atribuicoes_avaliacao_avaliador_id_fkey foreign key (avaliador_id)
    references public.perfis (id),
  constraint atribuicoes_avaliacao_avaliado_id_fkey foreign key (avaliado_id)
    references public.perfis (id),
  constraint atribuicoes_avaliacao_distintos_check
    check (avaliador_id <> avaliado_id or tipo_relacionamento = 'autoavaliacao'),
  constraint atribuicoes_avaliacao_unica_key
    unique (ciclo_id, avaliador_id, avaliado_id)
);

create table public.respostas_avaliacao (
  id uuid not null default gen_random_uuid(),
  atribuicao_id uuid not null,
  pergunta_id uuid not null,
  nota smallint not null check (nota between 1 and 5),
  criado_em timestamptz not null default now(),
  constraint respostas_avaliacao_pkey primary key (id),
  constraint respostas_avaliacao_atribuicao_id_fkey foreign key (atribuicao_id)
    references public.atribuicoes_avaliacao (id) on delete cascade,
  constraint respostas_avaliacao_pergunta_id_fkey foreign key (pergunta_id)
    references public.perguntas_template (id),
  constraint respostas_avaliacao_unica_key unique (atribuicao_id, pergunta_id)
);

create table public.feedback_aberto_avaliacao (
  id uuid not null default gen_random_uuid(),
  atribuicao_id uuid not null unique,
  pontos_fortes varchar,
  pontos_melhoria varchar,
  criado_em timestamptz not null default now(),
  constraint feedback_aberto_avaliacao_pkey primary key (id),
  constraint feedback_aberto_avaliacao_atribuicao_id_fkey foreign key (atribuicao_id)
    references public.atribuicoes_avaliacao (id) on delete cascade
);

create index perfis_gestor_id_idx on public.perfis (gestor_id);
create index membros_time_perfil_id_idx on public.membros_time (perfil_id);
create index perguntas_template_template_id_ordem_idx
  on public.perguntas_template (template_id, ordem);
create index ciclos_avaliacao_status_idx on public.ciclos_avaliacao (status);
create index atribuicoes_avaliacao_avaliador_status_idx
  on public.atribuicoes_avaliacao (avaliador_id, status);
create index atribuicoes_avaliacao_avaliado_idx
  on public.atribuicoes_avaliacao (avaliado_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome_completo, email)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nome_completo'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Novo usuario'
    ),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles if users were created before this migration.
insert into public.perfis (id, nome_completo, email, papel)
select
  users.id,
  coalesce(
    nullif(trim(users.raw_user_meta_data ->> 'nome_completo'), ''),
    nullif(split_part(coalesce(users.email, ''), '@', 1), ''),
    'Novo usuario'
  ),
  users.email,
  case
    when row_number() over (order by users.created_at, users.id) = 1
      then 'admin'::public.papel_perfil
    else 'colaborador'::public.papel_perfil
  end
from auth.users as users
where users.email is not null
on conflict (id) do nothing;

create or replace function public.meu_papel()
returns public.papel_perfil
language sql
security definer
stable
set search_path = ''
as $$
  select p.papel
  from public.perfis as p
  where p.id = (select auth.uid());
$$;

create or replace function public.meus_subordinados()
returns setof uuid
language sql
security definer
stable
set search_path = ''
as $$
  select p.id
  from public.perfis as p
  where p.gestor_id = (select auth.uid());
$$;

revoke all on function public.meu_papel() from public;
revoke all on function public.meus_subordinados() from public;
grant execute on function public.meu_papel() to authenticated;
grant execute on function public.meus_subordinados() to authenticated;

alter table public.perfis enable row level security;
alter table public.times enable row level security;
alter table public.membros_time enable row level security;
alter table public.templates_competencia enable row level security;
alter table public.perguntas_template enable row level security;
alter table public.ciclos_avaliacao enable row level security;
alter table public.atribuicoes_avaliacao enable row level security;
alter table public.respostas_avaliacao enable row level security;
alter table public.feedback_aberto_avaliacao enable row level security;

grant usage on schema public to authenticated, service_role;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on public.times to authenticated;
grant insert, update, delete on public.membros_time to authenticated;
grant insert, update, delete on public.templates_competencia to authenticated;
grant insert, update, delete on public.perguntas_template to authenticated;
grant insert, update, delete on public.ciclos_avaliacao to authenticated;
grant insert, update, delete on public.atribuicoes_avaliacao to authenticated;
grant insert, update, delete on public.respostas_avaliacao to authenticated;
grant insert, update, delete on public.feedback_aberto_avaliacao to authenticated;
grant all on all tables in schema public to service_role;

create policy perfis_select_self_or_admin_rh on public.perfis
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select public.meu_papel()) in ('admin', 'rh')
  );

create policy times_select_authenticated on public.times
  for select to authenticated using (true);
create policy times_write_admin_rh on public.times
  for all to authenticated
  using ((select public.meu_papel()) in ('admin', 'rh'))
  with check ((select public.meu_papel()) in ('admin', 'rh'));

create policy membros_time_select_authenticated on public.membros_time
  for select to authenticated using (true);
create policy membros_time_write_admin_rh on public.membros_time
  for all to authenticated
  using ((select public.meu_papel()) in ('admin', 'rh'))
  with check ((select public.meu_papel()) in ('admin', 'rh'));

create policy templates_select_authenticated on public.templates_competencia
  for select to authenticated using (true);
create policy templates_write_admin_rh on public.templates_competencia
  for all to authenticated
  using ((select public.meu_papel()) in ('admin', 'rh'))
  with check ((select public.meu_papel()) in ('admin', 'rh'));

create policy perguntas_select_authenticated on public.perguntas_template
  for select to authenticated using (true);
create policy perguntas_write_admin_rh on public.perguntas_template
  for all to authenticated
  using ((select public.meu_papel()) in ('admin', 'rh'))
  with check ((select public.meu_papel()) in ('admin', 'rh'));

create policy ciclos_select_authenticated on public.ciclos_avaliacao
  for select to authenticated using (true);
create policy ciclos_write_admin_rh on public.ciclos_avaliacao
  for all to authenticated
  using ((select public.meu_papel()) in ('admin', 'rh'))
  with check ((select public.meu_papel()) in ('admin', 'rh'));

create policy atribuicoes_select_envolvidos on public.atribuicoes_avaliacao
  for select to authenticated
  using (
    avaliador_id = (select auth.uid())
    or avaliado_id = (select auth.uid())
    or avaliado_id in (select public.meus_subordinados())
    or (select public.meu_papel()) in ('admin', 'rh')
  );
create policy atribuicoes_write_admin_rh on public.atribuicoes_avaliacao
  for all to authenticated
  using ((select public.meu_papel()) in ('admin', 'rh'))
  with check ((select public.meu_papel()) in ('admin', 'rh'));

create policy respostas_select_envolvidos on public.respostas_avaliacao
  for select to authenticated
  using (
    exists (
      select 1
      from public.atribuicoes_avaliacao as atribuicao
      where atribuicao.id = atribuicao_id
        and (
          atribuicao.avaliador_id = (select auth.uid())
          or atribuicao.avaliado_id = (select auth.uid())
          or atribuicao.avaliado_id in (select public.meus_subordinados())
          or (select public.meu_papel()) in ('admin', 'rh')
        )
    )
  );
create policy respostas_insert_avaliador on public.respostas_avaliacao
  for insert to authenticated
  with check (
    exists (
      select 1 from public.atribuicoes_avaliacao as atribuicao
      where atribuicao.id = atribuicao_id
        and atribuicao.avaliador_id = (select auth.uid())
    )
  );
create policy respostas_update_avaliador on public.respostas_avaliacao
  for update to authenticated
  using (
    exists (
      select 1 from public.atribuicoes_avaliacao as atribuicao
      where atribuicao.id = atribuicao_id
        and atribuicao.avaliador_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.atribuicoes_avaliacao as atribuicao
      where atribuicao.id = atribuicao_id
        and atribuicao.avaliador_id = (select auth.uid())
    )
  );

create policy feedback_aberto_select_envolvidos on public.feedback_aberto_avaliacao
  for select to authenticated
  using (
    exists (
      select 1
      from public.atribuicoes_avaliacao as atribuicao
      where atribuicao.id = atribuicao_id
        and (
          atribuicao.avaliador_id = (select auth.uid())
          or atribuicao.avaliado_id = (select auth.uid())
          or atribuicao.avaliado_id in (select public.meus_subordinados())
          or (select public.meu_papel()) in ('admin', 'rh')
        )
    )
  );
create policy feedback_aberto_insert_avaliador on public.feedback_aberto_avaliacao
  for insert to authenticated
  with check (
    exists (
      select 1 from public.atribuicoes_avaliacao as atribuicao
      where atribuicao.id = atribuicao_id
        and atribuicao.avaliador_id = (select auth.uid())
    )
  );
create policy feedback_aberto_update_avaliador on public.feedback_aberto_avaliacao
  for update to authenticated
  using (
    exists (
      select 1 from public.atribuicoes_avaliacao as atribuicao
      where atribuicao.id = atribuicao_id
        and atribuicao.avaliador_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.atribuicoes_avaliacao as atribuicao
      where atribuicao.id = atribuicao_id
        and atribuicao.avaliador_id = (select auth.uid())
    )
  );
