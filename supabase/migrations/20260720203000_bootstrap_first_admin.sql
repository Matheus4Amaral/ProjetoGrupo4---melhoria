-- Bootstrap access for a brand-new project: the first Auth user becomes admin.
-- Once a profile exists, every subsequent Auth user starts as colaborador.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  initial_role public.papel_perfil;
begin
  select case
    when exists (select 1 from public.perfis)
      then 'colaborador'::public.papel_perfil
    else 'admin'::public.papel_perfil
  end
  into initial_role;

  insert into public.perfis (id, nome_completo, email, papel)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nome_completo'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Novo usuario'
    ),
    new.email,
    initial_role
  );

  return new;
end;
$$;
