-- Allow admins to view all profiles
create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using (has_role(auth.uid(), 'admin'::app_role));