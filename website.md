# ACE TECH INSIGHT — FULL IMPLEMENTATION PLAN
> This file is the single source of truth for building the Ace Tech Insight blog platform.
> Follow every phase in order. Do not skip steps. Do not move to the next phase until the current one is fully working and tested.

---

## PROJECT OVERVIEW

**What we are building:**
A fully custom, production-grade tech blog and CMS called Ace Tech Insight. It includes a public-facing blog, a full admin dashboard, SEO tools powered by Gemini and Claude APIs, a keyword trend tracker, content calendar, analytics, newsletter, comments, and monetization features.

**Tech Stack:**
- Frontend: HTML / CSS / Vanilla JavaScript (from Google Stitch export)
- Backend & Database: Supabase (Postgres)
- Auth: Supabase Auth
- Rich Text Editor: Tiptap (via CDN)
- AI Writing Assistant: Claude API (claude-sonnet-4-20250514)
- SEO Research: Gemini API (via Google AI Studio)
- Image Search: Unsplash API
- Email: Resend API
- Charts: Chart.js (via CDN)
- Hosting: Vercel
- Local Dev: live-server

**Environment Variables (stored in .env):**
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
CLAUDE_API_KEY=your_claude_api_key
GEMINI_API_KEY=your_gemini_api_key
UNSPLASH_KEY=your_unsplash_access_key
RESEND_API_KEY=your_resend_api_key
```

**Project Folder Structure:**
```
ace-tech-insight/
├── public/                  # Public blog pages (from Google Stitch)
│   ├── index.html           # Homepage
│   ├── article.html         # Single post page
│   ├── search.html          # Search results page
│   ├── category.html        # Category browse page
│   ├── about.html           # About page
│   ├── 404.html             # Error page
│   └── rss.xml              # RSS feed
├── dashboard/               # Admin CMS (protected)
│   ├── login.html           # Login page
│   ├── index.html           # Dashboard home
│   ├── editor.html          # Post editor
│   ├── posts.html           # Posts manager
│   ├── categories.html      # Categories & tags manager
│   ├── comments.html        # Comments manager
│   ├── analytics.html       # Analytics dashboard
│   ├── keywords.html        # Keyword trend tracker
│   ├── calendar.html        # Content calendar
│   ├── subscribers.html     # Subscriber manager
│   ├── newsletter.html      # Newsletter broadcast
│   └── monetization.html    # Sponsorship & revenue
├── js/                      # All JavaScript modules
│   ├── config.js            # Environment variables loader
│   ├── supabase.js          # Supabase client
│   ├── auth.js              # Auth logic
│   ├── api.js               # All database functions
│   ├── editor.js            # Tiptap editor setup
│   ├── seo.js               # SEO scorer (Claude + Gemini)
│   ├── trends.js            # Keyword tracker
│   ├── analytics.js         # View tracking + charts
│   ├── unsplash.js          # Image picker
│   ├── newsletter.js        # Email broadcast
│   └── utils.js             # Shared utility functions
├── css/
│   ├── dashboard.css        # Dashboard styles
│   └── editor.css           # Editor specific styles
├── .env                     # API keys (never commit this)
├── .gitignore               # Must include .env
└── vercel.json              # Vercel deployment config
```

---

## PHASE 1 — DATABASE SCHEMA

**Goal:** Create all Supabase tables in one SQL script.

Go to Supabase → SQL Editor → New Query. Paste and run this entire script:

```sql
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
```

**Verify:** Go to Supabase → Table Editor. You should see all tables listed.

---

## PHASE 2 — SUPABASE CLIENT & CONFIG

**File: js/config.js**
- Export all API keys as constants
- Never hardcode keys directly in other files
- Import this file at the top of every JS file that needs a key

**File: js/supabase.js**
- Import createClient from Supabase CDN
- Initialize with SUPABASE_URL and SUPABASE_ANON_KEY from config.js
- Export the supabase client as default
- This is the single database connection used everywhere

---

## PHASE 3 — AUTHENTICATION

**File: js/auth.js**

Implement these functions:

1. login(email, password) — signs in with Supabase auth, redirects to dashboard/index.html on success, shows error on failure
2. logout() — signs out, redirects to dashboard/login.html
3. requireAuth() — checks for active session, redirects to login if none. Call this at the top of EVERY dashboard page
4. getUser() — returns current logged in user object

**File: dashboard/login.html**
- Clean login form matching your Stitch dark theme
- On submit calls login()
- Shows loading state while authenticating
- Shows error message on failure
- If already logged in redirect to dashboard automatically

**Test before moving on:**
- Create admin user in Supabase → Authentication → Users → Invite User
- Test login works
- Test protected page redirects to login when logged out
- Test logout redirects to login

---

## PHASE 4 — API LAYER

**File: js/api.js**

Write clean async functions grouped by resource:

**POSTS**
- getPosts(filters) — fetch published posts with optional filters
- getAllPosts() — fetch all posts including drafts
- getPost(slug) — fetch single post by slug with category and tags
- getFeaturedPosts() — fetch posts where featured = true
- createPost(data) — insert new post
- updatePost(id, data) — update existing post
- deletePost(id) — delete post
- trackView(postId) — call increment_views RPC
- trackRead(postId) — call increment_reads RPC

**CATEGORIES**
- getCategories() — fetch all
- createCategory(data)
- updateCategory(id, data)
- deleteCategory(id)

**TAGS**
- getTags() — fetch all
- createTag(data)
- deleteTag(id)

**COMMENTS**
- getComments(postId) — approved comments only
- getAllComments() — all for dashboard
- submitComment(data) — pending status
- approveComment(id)
- deleteComment(id)

**SUBSCRIBERS**
- subscribe(email, name)
- getSubscribers()
- unsubscribe(email)

**ANALYTICS**
- getPostAnalytics(postId)
- getDashboardStats() — totals for overview cards
- getTopPosts(limit)

**KEYWORDS**
- getKeywords()
- addKeyword(data)
- updateKeyword(id, data)
- deleteKeyword(id)

**CALENDAR**
- getCalendarEntries(month, year)
- createCalendarEntry(data)
- updateCalendarEntry(id, data)
- deleteCalendarEntry(id)

---

## PHASE 5 — PUBLIC BLOG PAGES

Wire all Stitch HTML pages to pull real data from Supabase. Do not redesign — only inject dynamic data into existing structure.

**Homepage (public/index.html)**
- On load call getPosts() and getFeaturedPosts()
- Replace hardcoded cards with dynamically generated ones
- Each card: cover image, category badge, title, excerpt, author, date, read time
- Empty state if no posts
- Wire search bar → search.html?q=query
- Newsletter signup calls subscribe(email, name)

**Single Post Page (public/article.html)**
- Read slug from URL: new URLSearchParams(window.location.search).get('slug')
- Call getPost(slug)
- Inject all post data into page
- Call trackView(post.id) on load
- Track read when user scrolls past 80% — once per session using sessionStorage
- Generate table of contents from H2/H3 headings
- Show approved comments + submission form
- Social share buttons: Twitter, LinkedIn, WhatsApp, copy link
- Post reactions: like, bookmark
- Premium blur if post.premium = true and reader not subscribed
- Inject JSON-LD Article schema
- Breadcrumbs: Home → Category → Post Title

**Search Page (public/search.html)**
- Read query from URL
- Call getPosts({ search: q })
- Show results count
- Category filter sidebar
- Sort by relevance or date
- Paginate 10 per page

**Category Page (public/category.html)**
- Read category slug from URL
- Fetch category + its posts
- Show category hero + posts grid

**About Page (public/about.html)**
- Static — no database needed
- Who Fortune is, why the blog exists, topics covered
- Link to newsletter signup

**404 Page (public/404.html)**
- Branded error page
- Link back to homepage + search bar

**RSS Feed (public/rss.xml)**
- Fetch all published posts
- Output valid RSS 2.0 XML

---

## PHASE 6 — ADMIN DASHBOARD PAGES

All dashboard pages must call requireAuth() at the very top.

**Dashboard Home (dashboard/index.html)**
- Stat cards: Total Posts, Total Views, Total Reads, Total Subscribers
- Recent posts table (last 5)
- Pending comments count
- Top 3 posts by views
- Upcoming calendar entries (next 7 days)
- Breakout keyword alerts
- Quick action buttons: New Post, View Analytics, Check Keywords

**Post Editor (dashboard/editor.html)**

Editor setup:
- Load Tiptap via CDN
- Extensions: StarterKit, Image, Link, Placeholder, CharacterCount, Highlight
- Toolbar: Bold, Italic, Underline, H1/H2/H3, Lists, Blockquote, Code Block, Image, Link, Undo, Redo
- Distraction free mode toggle

Post settings sidebar:
- Status toggle: Draft / Published / Scheduled
- Scheduled date/time picker
- Category dropdown
- Tags multi-select
- Featured toggle
- Premium toggle
- Cover image upload + Unsplash picker button
- Slug field (auto-generated from title, editable)

SEO panel:
- Focus keyword input
- Meta title (character counter max 60)
- Meta description (character counter max 160)
- OG image upload
- Canonical URL
- SEO score 0-100 with color indicator
- SEO checklist

Gemini + Claude SEO panel:
- Enter keyword → click Analyze
- Gemini returns: recommended word count, NLP terms, competitor titles, People Also Ask
- Claude scores content against Gemini data live every 30 seconds
- NLP terms shown as checkboxes: green if in content, red if missing

AI Writing Assistant:
- Floating panel with prompt input
- Quick actions: Improve paragraph, Write intro, Suggest headlines, Fix grammar, Optimize for keyword, Write meta description, Expand section, Summarize
- User selects text → clicks action → Claude returns rewrite → accept or reject
- Custom prompt input

Unsplash Picker (modal):
- Search input calls Unsplash API
- Grid of results
- Click to insert into post or set as cover
- Attribution auto-added as caption

Comparison Card Block:
- Toolbar button inserts card template
- Fields: rank, product image, name, rating, price, best for, buy link, review link
- Renders as styled card in published post

Autosave:
- Every 30 seconds save to localStorage
- Every 60 seconds save to Supabase as revision
- Show Saved / Saving indicator

Word count and reading time live in bottom bar

Readability score on demand: Easy / Medium / Hard

Revision history panel:
- List of saved revisions with timestamps
- Preview and restore any revision

Internal link picker:
- Two tabs in link dialog: External URL and Internal Post
- Internal Post tab: searchable list of published posts

**Posts Manager (dashboard/posts.html)**
- Table: title, category, status, views, date, actions
- Filter by status and category
- Search by title
- Sort by date, views, title
- Actions: Edit, Delete, Duplicate, Toggle Featured
- Bulk actions: Delete, Publish, Change category
- Pagination 20 per page

**Categories & Tags Manager (dashboard/categories.html)**
- Categories table + add form
- Tags table + add form
- Cannot delete if posts are using it — show warning

**Comments Manager (dashboard/comments.html)**
- Table: author, post, preview, status, date, actions
- Filter by status
- Approve, Reject, Delete actions
- Bulk approve/delete

**Analytics Dashboard (dashboard/analytics.html)**
- Overview cards: Total Views, Reads, Avg Read Rate, Subscribers
- Line chart: Views over 30 days
- Line chart: Subscriber growth
- Bar chart: Top 10 posts
- All posts table with view/read counts
- Date range filter: 7/30/90 days, all time

**Keyword Trend Tracker (dashboard/keywords.html)**
- Add keyword form: keyword + category
- Keywords table: keyword, category, trend score, status, post idea, linked post, actions
- Google Trends embed per keyword
- Daily breakout section from Google Trends RSS
- Breakout alert when tracked keyword appears in trending RSS
- Post idea logger per keyword
- Link keyword to existing post or create new post with keyword pre-filled

**Content Calendar (dashboard/calendar.html)**
- Monthly calendar view
- Navigate months with prev/next
- Color coded entries by status: idea=grey, writing=blue, drafted=yellow, scheduled=orange, published=green
- Click day to add entry
- Click entry to edit
- Entry fields: title, date, status, keyword, category, platforms, notes
- Writing goals widget: monthly target + progress bar
- Post idea backlog below calendar
- Breakout keywords from trend tracker appear as suggested ideas

**Subscriber Manager (dashboard/subscribers.html)**
- Table: name, email, status, premium, join date
- Filter and search
- Export CSV
- Manually add subscriber
- Stats: total active, premium, new this month

**Newsletter Broadcast (dashboard/newsletter.html)**
- Compose: subject + rich text body
- Recipient selector: All / Active / Premium
- Preview mode
- Send test email first
- Send broadcast with confirmation
- Sent broadcasts history
- Uses Resend API

**Monetization Dashboard (dashboard/monetization.html)**
- Sponsor table + add/edit form
- Revenue tracker
- Premium content stats
- Support widget configuration

---

## PHASE 7 — SEO SUITE

**File: js/seo.js**

generateMetaTags(post) — inject into head:
- title, meta description
- og:title, og:description, og:image, og:url
- twitter card tags
- canonical link

generateJSONLD(post) — inject Article schema with headline, datePublished, author, description

generateSitemap() — fetch published posts, output RSS/XML sitemap

calculateSEOScore(post, content) — returns 0-100:
- Keyword in title: +15
- Keyword in meta description: +10
- Keyword in first paragraph: +10
- Meta description 120-160 chars: +10
- Meta title 50-60 chars: +10
- At least one H2: +10
- At least one internal link: +10
- At least one image: +10
- Word count over 1000: +10
- Keyword density 1-2%: +5

checkReadability(content) — average sentence length → Easy / Medium / Hard

---

## PHASE 8 — ANALYTICS & TRACKING

**File: js/analytics.js**

initTracking(postId):
- Call trackView immediately on article page load
- Scroll listener: when user passes 80% call trackRead — once per session using sessionStorage

renderViewsChart(data) — Chart.js line chart, views over time
renderSubscriberChart(data) — subscriber growth line chart
renderTopPostsChart(data) — top posts bar chart

All charts:
- Match dark/light mode
- Responsive
- Tooltips on hover
- Animate on load

---

## PHASE 9 — KEYWORD TREND TRACKER

**File: js/trends.js**

fetchGoogleTrendsRSS():
- Fetch from https://trends.google.com/trending/rss?geo=NG (Nigeria)
- Also fetch geo=US for global tech trends
- Parse RSS XML, extract trending topics

matchKeywordsToTrends(keywords, trends):
- Compare tracked keywords to trending topics
- Return matches as breakout alerts

renderTrendsEmbed(keyword):
- Generate Google Trends iframe embed URL
- https://trends.google.com/trends/embed/explore/TIMESERIES?q=keyword

updateKeywordStatus(id, status):
- Call api.js to set keyword status to 'breakout' on match

Run fetchGoogleTrendsRSS and matchKeywordsToTrends on dashboard load and every 60 minutes via setInterval.

---

## PHASE 10 — UNSPLASH IMAGE PICKER

**File: js/unsplash.js**

searchImages(query):
- GET https://api.unsplash.com/search/photos?query=${query}&per_page=12&client_id=YOUR_KEY

renderImageGrid(images):
- Show thumbnails in modal grid
- Photographer name on hover

insertImage(imageUrl, altText, creditText):
- Insert into Tiptap editor at cursor with attribution caption

setCoverImage(imageUrl):
- Set as post cover image field

Modal behavior:
- Auto-focus search input on open
- Debounced search 500ms
- Click image to insert and close
- Escape key closes

---

## PHASE 11 — NEWSLETTER

**File: js/newsletter.js**

sendBroadcast(subject, body, recipientType):
- Call Resend API POST https://api.resend.com/emails
- From: Fortune at newsletter@acetechinsight.com
- To: list from getSubscribers() filtered by recipientType
- Subject and HTML body from compose form

sendWelcomeEmail(email, name):
- Auto-send when new subscriber signs up

sendTestEmail(subject, body):
- Send to your own email before broadcast

---

## PHASE 12 — CONTENT CALENDAR

- Full monthly grid with correct day positioning
- Drag and drop to reschedule using browser native drag API
- Writing goals: store monthly target in localStorage, count published posts this month from Supabase, show progress bar
- Backlog: calendar entries with no planned_date listed below calendar as draggable cards

---

## PHASE 13 — DEPLOY TO VERCEL

vercel.json:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/public/$1" }
  ]
}
```

Steps:
1. Create GitHub repo: ace-tech-insight
2. Add .gitignore with .env listed
3. Push all files to GitHub
4. vercel.com → New Project → Import from GitHub
5. Add all environment variables from .env in Vercel settings
6. Deploy
7. Add custom domain in Vercel → Domains
8. Submit sitemap to Google Search Console
9. Set up Google Analytics or Plausible

---

## PHASE 14 — LAUNCH CHECKLIST

**Public Blog:**
- [ ] Homepage loads real posts from Supabase
- [ ] Single post page loads with correct meta tags
- [ ] Search returns relevant results
- [ ] Category pages work
- [ ] Comments can be submitted
- [ ] Newsletter signup saves to Supabase
- [ ] Social share buttons work
- [ ] Dark/light mode saves preference
- [ ] 404 page shows for invalid URLs
- [ ] RSS feed is valid XML
- [ ] Mobile responsive on all pages
- [ ] Page speed acceptable

**Dashboard:**
- [ ] Login works
- [ ] Protected pages redirect to login
- [ ] Can create, edit, publish, delete posts
- [ ] Autosave works
- [ ] Tiptap toolbar all buttons work
- [ ] Unsplash picker works
- [ ] Comparison card block inserts correctly
- [ ] SEO score updates live
- [ ] Gemini keyword analysis returns data
- [ ] Claude AI assistant responds
- [ ] Categories and tags work
- [ ] Comments can be approved and deleted
- [ ] Analytics charts render
- [ ] Keyword tracker fetches RSS
- [ ] Content calendar renders
- [ ] Newsletter sends via Resend
- [ ] Subscriber list correct

**SEO:**
- [ ] All posts have meta title and description
- [ ] OG tags render correctly (test opengraph.xyz)
- [ ] JSON-LD valid (test Google Rich Results Test)
- [ ] Sitemap submitted to Google Search Console
- [ ] Robots.txt accessible

---

## RULES FOR CLAUDE CODE TO FOLLOW

1. Complete one phase fully before moving to the next
2. Test every function before building the next one
3. Never hardcode API keys — always use config.js
4. Handle all errors gracefully with user-friendly messages
5. Add loading states to every async operation
6. Every page must be mobile responsive
7. Never break the Stitch UI — only add to it
8. Comment every function
9. Keep functions small and single-purpose
10. If anything is unclear stop and ask before building the wrong thing

---

*Built by Fortune using Claude Code + Supabase + Google Stitch*
*Last updated: March 2026*s