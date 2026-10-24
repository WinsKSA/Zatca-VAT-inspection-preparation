-- Fahs SaaS: multi-company VAT inspection platform
-- Every company (tenant) is isolated by Row Level Security: a user only ever sees companies they belong to.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------ people
create table public.profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  platform_admin boolean not null default false,   -- the SaaS owner(s): see all companies in the admin console
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------------ companies (tenants)
create table public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) between 2 and 200),
  vat_number  text,
  cr_number   text,
  plan        text not null default 'free',
  status      text not null default 'active' check (status in ('active','suspended')),
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

create table public.memberships (
  company_id  uuid not null references public.companies(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('owner','admin','editor','viewer')),
  created_at  timestamptz not null default now(),
  primary key (company_id, user_id)
);
create index on public.memberships(user_id);

create table public.invitations (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  email       text not null,
  role        text not null check (role in ('admin','editor','viewer')),
  invited_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  accepted_at timestamptz,
  unique (company_id, email)
);

-- ------------------------------------------------------------------ data: one JSON document per company / year / dataset
-- year = '' for datasets shared across years (settings, inspection case, ZATCA requests, checklist)
create table public.datasets (
  company_id  uuid not null references public.companies(id) on delete cascade,
  year        text not null default '',
  key         text not null,
  data        jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id),
  primary key (company_id, year, key)
);

create table public.audit_log (
  id          bigserial primary key,
  company_id  uuid references public.companies(id) on delete cascade,
  user_id     uuid references auth.users(id),
  email       text,
  action      text not null,
  detail      text,
  at          timestamptz not null default now()
);
create index on public.audit_log(company_id, at desc);

-- ------------------------------------------------------------------ helpers (security definer so policies don't recurse)
create or replace function public.my_role(c uuid) returns text
language sql stable security definer set search_path = public as $$
  select role from public.memberships where company_id = c and user_id = auth.uid()
$$;
create or replace function public.is_platform_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select platform_admin from public.profiles where user_id = auth.uid()), false)
$$;
create or replace function public.can_edit(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.my_role(c) in ('owner','admin','editor')
    and (select status from public.companies where id = c) = 'active'
$$;
create or replace function public.can_manage(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.my_role(c) in ('owner','admin')
$$;

-- new auth user -> profile, and join any companies that invited this email
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(user_id, email, full_name)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (user_id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------ RPCs used by the app
create or replace function public.accept_invitations() returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; inv record; me text := lower(coalesce(auth.jwt()->>'email',''));
begin
  for inv in select * from public.invitations where lower(email) = me and accepted_at is null loop
    insert into public.memberships(company_id, user_id, role) values (inv.company_id, auth.uid(), inv.role)
      on conflict (company_id, user_id) do nothing;
    update public.invitations set accepted_at = now() where id = inv.id;
    insert into public.audit_log(company_id, user_id, email, action) values (inv.company_id, auth.uid(), me, 'Joined (invitation accepted as ' || inv.role || ')');
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function public.create_company(p_name text, p_vat text default null, p_cr text default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into public.companies(name, vat_number, cr_number, created_by) values (trim(p_name), p_vat, p_cr, auth.uid()) returning id into cid;
  insert into public.memberships(company_id, user_id, role) values (cid, auth.uid(), 'owner');
  insert into public.audit_log(company_id, user_id, email, action, detail) values (cid, auth.uid(), auth.jwt()->>'email', 'Company created', p_name);
  return cid;
end $$;

create or replace function public.invite_member(p_company uuid, p_email text, p_role text) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if not public.can_manage(p_company) then raise exception 'forbidden'; end if;
  if p_role not in ('admin','editor','viewer') then raise exception 'bad role'; end if;
  select user_id into uid from public.profiles where email = lower(trim(p_email));
  if uid is not null then
    insert into public.memberships(company_id, user_id, role) values (p_company, uid, p_role)
      on conflict (company_id, user_id) do update set role = excluded.role;
  else
    insert into public.invitations(company_id, email, role, invited_by) values (p_company, lower(trim(p_email)), p_role, auth.uid())
      on conflict (company_id, email) do update set role = excluded.role, accepted_at = null;
  end if;
  insert into public.audit_log(company_id, user_id, email, action, detail) values (p_company, auth.uid(), auth.jwt()->>'email', 'Invited member', lower(trim(p_email)) || ' as ' || p_role);
end $$;

create or replace function public.set_member_role(p_company uuid, p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage(p_company) then raise exception 'forbidden'; end if;
  if p_user = auth.uid() then raise exception 'cannot change own role'; end if;
  if p_role not in ('admin','editor','viewer') then raise exception 'bad role'; end if;
  if (select role from public.memberships where company_id = p_company and user_id = p_user) = 'owner' then raise exception 'cannot change the owner'; end if;
  update public.memberships set role = p_role where company_id = p_company and user_id = p_user;
  insert into public.audit_log(company_id, user_id, email, action, detail) values (p_company, auth.uid(), auth.jwt()->>'email', 'Changed role', p_user::text || ' -> ' || p_role);
end $$;

create or replace function public.remove_member(p_company uuid, p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage(p_company) then raise exception 'forbidden'; end if;
  if p_user = auth.uid() then raise exception 'cannot remove yourself'; end if;
  if (select role from public.memberships where company_id = p_company and user_id = p_user) = 'owner' then raise exception 'cannot remove the owner'; end if;
  delete from public.memberships where company_id = p_company and user_id = p_user;
  insert into public.audit_log(company_id, user_id, email, action, detail) values (p_company, auth.uid(), auth.jwt()->>'email', 'Removed member', p_user::text);
end $$;

-- team list with emails (members + pending invitations)
create or replace function public.company_team(p_company uuid)
returns table(user_id uuid, email text, full_name text, role text, pending boolean, since timestamptz)
language sql stable security definer set search_path = public as $$
  select m.user_id, p.email, p.full_name, m.role, false, m.created_at
    from public.memberships m join public.profiles p on p.user_id = m.user_id
   where m.company_id = p_company and public.my_role(p_company) is not null
  union all
  select null, i.email, null, i.role, true, i.created_at
    from public.invitations i
   where i.company_id = p_company and i.accepted_at is null and public.can_manage(p_company)
  order by 6
$$;

-- platform admin console: every company with team size and last activity
create or replace function public.platform_companies()
returns table(id uuid, name text, vat_number text, plan text, status text, created_at timestamptz, members bigint, last_activity timestamptz, owner_email text)
language sql stable security definer set search_path = public as $$
  select c.id, c.name, c.vat_number, c.plan, c.status, c.created_at,
         (select count(*) from public.memberships m where m.company_id = c.id),
         (select max(at) from public.audit_log a where a.company_id = c.id),
         (select p.email from public.memberships m join public.profiles p on p.user_id = m.user_id where m.company_id = c.id and m.role = 'owner' limit 1)
    from public.companies c
   where public.is_platform_admin()
   order by c.created_at desc
$$;

create or replace function public.platform_set_status(p_company uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'forbidden'; end if;
  update public.companies set status = p_status where id = p_company;
  insert into public.audit_log(company_id, user_id, email, action, detail) values (p_company, auth.uid(), auth.jwt()->>'email', 'Platform: status set', p_status);
end $$;

-- ------------------------------------------------------------------ Row Level Security
alter table public.profiles    enable row level security;
alter table public.companies   enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.datasets    enable row level security;
alter table public.audit_log   enable row level security;

create policy "own profile" on public.profiles for select using (user_id = auth.uid() or public.is_platform_admin());
create policy "update own profile" on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid() and platform_admin = (select platform_admin from public.profiles where user_id = auth.uid()));

create policy "members see company" on public.companies for select using (public.my_role(id) is not null or public.is_platform_admin());
create policy "managers update company" on public.companies for update using (public.can_manage(id)) with check (public.can_manage(id));

create policy "members see memberships" on public.memberships for select using (public.my_role(company_id) is not null);
create policy "managers see invitations" on public.invitations for select using (public.can_manage(company_id));

create policy "members read data" on public.datasets for select using (public.my_role(company_id) is not null);
create policy "editors insert data" on public.datasets for insert with check (public.can_edit(company_id));
create policy "editors update data" on public.datasets for update using (public.can_edit(company_id)) with check (public.can_edit(company_id));
create policy "managers delete data" on public.datasets for delete using (public.can_manage(company_id));

create policy "members read log" on public.audit_log for select using (public.my_role(company_id) is not null or public.is_platform_admin());
create policy "members write log" on public.audit_log for insert with check (public.my_role(company_id) is not null and user_id = auth.uid());

-- RPC permissions: signed-in users only
revoke all on function public.create_company(text,text,text), public.invite_member(uuid,text,text), public.set_member_role(uuid,uuid,text),
  public.remove_member(uuid,uuid), public.accept_invitations(), public.company_team(uuid), public.platform_companies(), public.platform_set_status(uuid,text) from public, anon;
grant execute on function public.create_company(text,text,text), public.invite_member(uuid,text,text), public.set_member_role(uuid,uuid,text),
  public.remove_member(uuid,uuid), public.accept_invitations(), public.company_team(uuid), public.platform_companies(), public.platform_set_status(uuid,text) to authenticated;
