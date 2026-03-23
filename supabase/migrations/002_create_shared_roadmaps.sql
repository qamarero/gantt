-- Shared roadmaps table for public/password-protected share links
-- Stores cached Linear data so shared views don't need a Linear token

CREATE TABLE public.shared_roadmaps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id text NOT NULL,
  project_name text NOT NULL,
  share_token text UNIQUE NOT NULL,
  password_hash text,
  expires_at timestamptz NOT NULL,
  cached_data jsonb,
  cached_at timestamptz,
  created_at timestamptz DEFAULT now()
);
