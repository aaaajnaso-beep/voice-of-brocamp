-- Create a secure function to assign admin role that bypasses RLS
create or replace function public.assign_admin_role(_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (_user_id, 'admin')
  on conflict (user_id, role) do update set role = 'admin';
end;
$$;