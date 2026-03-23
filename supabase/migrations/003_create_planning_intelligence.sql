-- Planning intelligence tables for tracking issue changes and status transitions
-- Used for analytics and audit logging

CREATE TABLE public.issue_change_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id text NOT NULL,
  project_id text NOT NULL,
  field_changed text NOT NULL,
  old_value text,
  new_value text,
  changed_by text,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.issue_change_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_changes" ON public.issue_change_history
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.status_transition_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id text NOT NULL,
  project_id text NOT NULL,
  from_status text,
  to_status text NOT NULL,
  transitioned_at timestamptz NOT NULL DEFAULT now(),
  duration_in_status interval
);

ALTER TABLE public.status_transition_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_transitions" ON public.status_transition_log
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
