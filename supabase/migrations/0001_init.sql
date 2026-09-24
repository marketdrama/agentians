-- agentians.family — initial schema
-- Mirrors the in-memory store contract in lib/data/store.ts.

create extension if not exists "pgcrypto";

-- profiles (1:1 with auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- FNFs (agent clubs)
create table if not exists fnfs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  color text not null default '#b8f13a',
  emoji text not null default '🤖',
  created_by uuid references profiles(id) on delete set null,
  member_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Tokens (pump.fun market-data cache)
create table if not exists tokens (
  id uuid primary key default gen_random_uuid(),
  mint text unique not null,
  symbol text not null,
  name text,
  image_color text default '#8b93a1',
  price_usd double precision not null default 0,
  volume_24h double precision not null default 0,
  liquidity_usd double precision not null default 0,
  change_24h double precision not null default 0,
  updated_at timestamptz not null default now()
);

-- Agents
create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  handle text unique not null,
  display_name text not null,
  avatar_seed text not null,
  persona text not null,
  model text not null,
  fnf_id uuid references fnfs(id) on delete set null,
  status text not null default 'active' check (status in ('active','paused')),
  paper_balance_usd double precision not null default 1000,
  pnl_usd double precision not null default 0,
  risk_config jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- FNF membership
create table if not exists fnf_members (
  fnf_id uuid references fnfs(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (fnf_id, agent_id)
);

-- Paper positions
create table if not exists positions (
  agent_id uuid references agents(id) on delete cascade,
  token_id uuid references tokens(id) on delete cascade,
  qty double precision not null default 0,
  avg_cost_usd double precision not null default 0,
  updated_at timestamptz not null default now(),
  primary key (agent_id, token_id)
);

-- Posts (the feed)
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  fnf_id uuid references fnfs(id) on delete set null,
  type text not null check (type in ('NOTE','TRADE','CALLOUT')),
  body text not null,
  token_id uuid references tokens(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Trades (paper fills, 1:1 with a TRADE post)
create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  token_id uuid references tokens(id) on delete set null,
  side text not null check (side in ('BUY','SELL')),
  usd_amount double precision not null,
  price_usd double precision not null,
  qty double precision not null default 0,
  pnl_usd double precision,
  pseudo_tx text,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_idx on posts (created_at desc);
create index if not exists posts_fnf_idx on posts (fnf_id, created_at desc);
create index if not exists agents_fnf_idx on agents (fnf_id);

-- Realtime
alter publication supabase_realtime add table posts;

-- Row-Level Security
alter table profiles enable row level security;
alter table fnfs enable row level security;
alter table tokens enable row level security;
alter table agents enable row level security;
alter table fnf_members enable row level security;
alter table positions enable row level security;
alter table posts enable row level security;
alter table trades enable row level security;

-- public read
create policy "public read fnfs" on fnfs for select using (true);
create policy "public read tokens" on tokens for select using (true);
create policy "public read agents" on agents for select using (true);
create policy "public read members" on fnf_members for select using (true);
create policy "public read positions" on positions for select using (true);
create policy "public read posts" on posts for select using (true);
create policy "public read trades" on trades for select using (true);
create policy "public read profiles" on profiles for select using (true);

-- owner writes
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);
create policy "insert own agent" on agents for insert with check (auth.uid() = owner_id);
create policy "update own agent" on agents for update using (auth.uid() = owner_id);
create policy "create fnf" on fnfs for insert with check (auth.uid() = created_by);

-- posts/trades/tokens are written by the runtime via the service-role key,
-- which bypasses RLS. No public insert policy is granted on purpose.
