-- Copy and paste this into the Supabase SQL Editor to create your tables

-- 1. Profiles Table (Extended)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name text,
  role text,
  email text,
  location text,
  bio text,
  skills text[],
  total_earnings numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 2. Jobs Table (Client Postings)
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  budget numeric NOT NULL,
  category text,
  status text DEFAULT 'open',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs are viewable by everyone."
  ON public.jobs FOR SELECT
  USING ( true );

CREATE POLICY "Clients can insert their own jobs."
  ON public.jobs FOR INSERT
  WITH CHECK ( auth.uid() = client_id );

CREATE POLICY "Clients can update their own jobs."
  ON public.jobs FOR UPDATE
  USING ( auth.uid() = client_id );

CREATE POLICY "Clients can delete their own jobs."
  ON public.jobs FOR DELETE
  USING ( auth.uid() = client_id );

-- 3. Chats/Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read messages they sent or received."
  ON public.messages FOR SELECT
  USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );

CREATE POLICY "Users can insert messages."
  ON public.messages FOR INSERT
  WITH CHECK ( auth.uid() = sender_id );
