-- Security fixes applied after 0001 (already live in the project as
-- lock_down_helper_functions and fix_null_permission_checks).

-- 1) helpers: never callable by anonymous visitors
revoke all on function public.my_role(uuid), public.can_edit(uuid), public.can_manage(uuid), public.is_platform_admin() from public, anon;
grant execute on function public.my_role(uuid), public.can_edit(uuid), public.can_manage(uuid), public.is_platform_admin() to authenticated;

-- 2) a user with no membership gets NULL from my_role(); NULL must mean "no", never "unknown"
create or replace function public.can_edit(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role(c) in ('owner','admin','editor'), false)
     and coalesce((select status from public.companies where id = c) = 'active', false)
$$;
create or replace function public.can_manage(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role(c) in ('owner','admin'), false)
$$;

-- 3) users may edit their own name but can never grant themselves platform admin
drop policy if exists "update own profile" on public.profiles;
drop policy if exists "update own name" on public.profiles;
create policy "update own name" on public.profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and platform_admin = public.is_platform_admin());
