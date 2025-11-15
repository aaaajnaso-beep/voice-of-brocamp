-- Create function to get top complainer
create or replace function public.get_top_complainer()
returns table (full_name text, complaint_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select p.full_name, count(c.id) as complaint_count
  from profiles p
  left join complaints c on p.id = c.user_id
  group by p.id, p.full_name
  order by complaint_count desc
  limit 1;
$$;