-- The SaaS owner becomes platform admin only after proving they own the mailbox (email confirmed).
create table if not exists public.platform_owners (email text primary key);
alter table public.platform_owners enable row level security;   -- no policies: invisible to app users
insert into public.platform_owners(email) values ('sobhyelsaify3600@gmail.com') on conflict do nothing;

create or replace function public.grant_platform_owner() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null and exists (select 1 from public.platform_owners o where o.email = lower(new.email)) then
    insert into public.profiles(user_id, email, full_name, platform_admin)
    values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), true)
    on conflict (user_id) do update set platform_admin = true;
  end if;
  return new;
end $$;
revoke all on function public.grant_platform_owner() from public, anon, authenticated;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed after insert or update of email_confirmed_at on auth.users
  for each row execute function public.grant_platform_owner();
