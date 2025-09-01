1) Supabase schema (create these tables in Supabase SQL editor)

-- plugins table
create table public.plugins (
  id bigserial primary key,
  name text,
  about text,
  link text,
  inserted_at timestamp with time zone default timezone('utc'::text, now())
);

-- env table
create table public.env (
  id bigserial primary key,
  name text,
  values text[],
  inserted_at timestamp with time zone default timezone('utc'::text, now())
);

-- tools table
create table public.tools (
  id bigserial primary key,
  name text,
  data text,
  inserted_at timestamp with time zone default timezone('utc'::text, now())
);

2) Policies (for quick testing only):
   - For development you can set the table Row Level Security to OFF so anon key can read/write.
   - For production: enable RLS and create policies that allow only authenticated admin or service role to write.

3) How to configure
   - Replace SUPABASE_URL and SUPABASE_ANON_KEY in both HTML files (search for 'YOUR_SUPABASE')

4) Deploy
   - Push these files to GitHub and use GitHub Pages, or deploy to Netlify/Vercel.
   - Make sure your Supabase project allows requests from your site origin or use CORS settings.

5) Notes
   - Admin password check is client-side only (SHUBHAM777). For stronger security, use Supabase Auth and server-side validation.
   - Realtime uses Supabase Realtime. Enable it in Supabase for live updates.

Enjoy — the site will update live for all users when admin adds/deletes entries.# Shubham--md
