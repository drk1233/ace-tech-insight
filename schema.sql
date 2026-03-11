-- CATEGORIES
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamptz default now()
);

-- TAGS
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- POSTS
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text,
  excerpt text,
  cover_image text,
  category_id uuid references categories(id),
  status text default 'draft' check (status in ('draft', 'published', 'scheduled')),
  published_at timestamptz,
  scheduled_at timestamptz,
  meta_title text,
  meta_description text,
  og_image text,
  canonical_url text,
  focus_keyword text,
  seo_score int default 0,
  premium boolean default false,
  views int default 0,
  reads int default 0,
  reading_time int default 0,
  word_count int default 0,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- POST TAGS (junction)
create table post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- COMMENTS
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author_name text not null,
  author_email text not null,
  content text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- BOOKMARKS
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  reader_email text,
  created_at timestamptz default now()
);

-- ANALYTICS
create table analytics (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  event text check (event in ('view', 'read', 'share', 'bookmark')),
  referrer text,
  created_at timestamptz default now()
);

-- SUBSCRIBERS
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  status text default 'active' check (status in ('active', 'unsubscribed')),
  premium boolean default false,
  created_at timestamptz default now()
);

-- KEYWORDS
create table keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  category text,
  trend_score int default 0,
  status text default 'tracking' check (status in ('tracking', 'breakout', 'used')),
  post_idea text,
  linked_post_id uuid references posts(id),
  created_at timestamptz default now()
);

-- CONTENT CALENDAR
create table calendar (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id),
  title text,
  planned_date date,
  status text default 'idea' check (status in ('idea', 'writing', 'drafted', 'scheduled', 'published')),
  keyword text,
  category_id uuid references categories(id),
  platforms text[],
  notes text,
  created_at timestamptz default now()
);

-- SPONSORS
create table sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  slot text,
  amount numeric,
  start_date date,
  end_date date,
  status text default 'active',
  created_at timestamptz default now()
);

-- POST REVISIONS
create table revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  content text,
  title text,
  saved_at timestamptz default now()
);

-- INCREMENT VIEWS FUNCTION
create or replace function increment_views(post_id uuid)
returns void as $$
  update posts set views = views + 1 where id = post_id;
$$ language sql;

-- INCREMENT READS FUNCTION
create or replace function increment_reads(post_id uuid)
returns void as $$
  update posts set reads = reads + 1 where id = post_id;
$$ language sql;

-- ROW LEVEL SECURITY
alter table posts enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table comments enable row level security;
alter table subscribers enable row level security;
alter table analytics enable row level security;
alter table keywords enable row level security;
alter table calendar enable row level security;

-- PUBLIC READ POLICIES
create policy "Public can read published posts" on posts
  for select using (status = 'published');

create policy "Public can read categories" on categories
  for select using (true);

create policy "Public can read tags" on tags
  for select using (true);

-- AUTHENTICATED FULL ACCESS
create policy "Admin full access posts" on posts
  for all using (auth.role() = 'authenticated');

create policy "Admin full access categories" on categories
  for all using (auth.role() = 'authenticated');

create policy "Admin full access keywords" on keywords
  for all using (auth.role() = 'authenticated');

create policy "Admin full access calendar" on calendar
  for all using (auth.role() = 'authenticated');
