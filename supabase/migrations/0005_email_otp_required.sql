-- Platform switch: require an email code (or emailed link) in every sign-in.
-- Off by default; turn on with: update public.app_config set otp_required = true;  (after custom SMTP is connected)
create table if not exists public.app_config (id int primary key default 1 check (id = 1), otp_required boolean not null default false);
insert into public.app_config(id) values (1) on conflict do nothing;
alter table public.app_config enable row level security;

-- what the sign-in screen needs to know before anyone is signed in
create or replace function public.auth_policy() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('otp_required', otp_required) from public.app_config where id = 1
$$;
revoke all on function public.auth_policy() from public;
grant execute on function public.auth_policy() to anon, authenticated;

-- true when the current session was proven by email (code, link or reset link), or the switch is off
create or replace function public.session_ok() returns boolean
language sql stable security definer set search_path = public as $$
  select not coalesce((select otp_required from public.app_config where id = 1), false)
      or exists (select 1 from jsonb_array_elements(coalesce(auth.jwt()->'amr','[]'::jsonb)) m
                  where m->>'method' in ('otp','magiclink','recovery','email/signup','invite'))
$$;
revoke all on function public.session_ok() from public, anon;
grant execute on function public.session_ok() to authenticated;

-- every policy and RPC goes through my_role / is_platform_admin, so gating them gates everything
create or replace function public.my_role(c uuid) returns text
language sql stable security definer set search_path = public as $$
  select role from public.memberships where company_id = c and user_id = auth.uid() and public.session_ok()
$$;
create or replace function public.is_platform_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select platform_admin from public.profiles where user_id = auth.uid()), false) and public.session_ok()
$$;
create or replace function public.create_company(p_name text, p_vat text default null, p_cr text default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if not public.session_ok() then raise exception 'email code required'; end if;
  insert into public.companies(name, vat_number, cr_number, created_by) values (trim(p_name), p_vat, p_cr, auth.uid()) returning id into cid;
  insert into public.memberships(company_id, user_id, role) values (cid, auth.uid(), 'owner');
  insert into public.audit_log(company_id, user_id, email, action, detail) values (cid, auth.uid(), auth.jwt()->>'email', 'Company created', p_name);
  return cid;
end $$;
