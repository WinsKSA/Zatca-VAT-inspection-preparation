-- Sign in with a username or an email address.
alter table public.profiles add column if not exists username text;
create unique index if not exists profiles_username_key on public.profiles (lower(username));
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format check (username is null or username ~ '^[a-z0-9._-]{3,32}$');

-- the sign-in form calls this before signing in: an email is returned as-is, a username is looked up
create or replace function public.login_email(p_login text) returns text
language sql stable security definer set search_path = public as $$
  select case when position('@' in p_login) > 0 then lower(trim(p_login))
              else (select email from public.profiles where lower(username) = lower(trim(p_login)) limit 1) end
$$;
revoke all on function public.login_email(text) from public;
grant execute on function public.login_email(text) to anon, authenticated;

-- a signed-in user chooses or changes their own username
create or replace function public.set_username(p_username text) returns text
language plpgsql security definer set search_path = public as $$
declare u text := lower(trim(p_username));
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if u !~ '^[a-z0-9._-]{3,32}$' then raise exception 'bad username'; end if;
  if exists (select 1 from public.profiles where lower(username) = u and user_id <> auth.uid()) then raise exception 'username taken'; end if;
  update public.profiles set username = u where user_id = auth.uid();
  return u;
end $$;
revoke all on function public.set_username(text) from public, anon;
grant execute on function public.set_username(text) to authenticated;

-- a username chosen at sign-up is kept when it is valid and free
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare u text := lower(nullif(trim(new.raw_user_meta_data->>'username'),''));
begin
  if u is not null and (u !~ '^[a-z0-9._-]{3,32}$' or exists (select 1 from public.profiles where lower(username) = u)) then u := null; end if;
  insert into public.profiles(user_id, email, full_name, username)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), u)
  on conflict (user_id) do nothing;
  return new;
end $$;
