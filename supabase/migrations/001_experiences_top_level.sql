-- Migration: Make experiences top-level (not tied to a table)
-- Run this in Supabase SQL Editor

-- 1. Drop the NOT NULL constraint on table_id
ALTER TABLE public.experiences ALTER COLUMN table_id DROP NOT NULL;

-- 2. Drop old foreign key constraint so NULL is allowed cleanly
-- (the REFERENCES with ON DELETE CASCADE stays, but NULL rows are fine)

-- 3. Replace experiences RLS — now owned by added_by user directly
DROP POLICY IF EXISTS "experiences_select" ON public.experiences;
DROP POLICY IF EXISTS "experiences_insert" ON public.experiences;
DROP POLICY IF EXISTS "experiences_update" ON public.experiences;
DROP POLICY IF EXISTS "experiences_delete" ON public.experiences;

CREATE POLICY "experiences_select" ON public.experiences FOR SELECT USING (auth.uid() = added_by);
CREATE POLICY "experiences_insert" ON public.experiences FOR INSERT WITH CHECK (auth.uid() = added_by);
CREATE POLICY "experiences_update" ON public.experiences FOR UPDATE USING (auth.uid() = added_by);
CREATE POLICY "experiences_delete" ON public.experiences FOR DELETE USING (auth.uid() = added_by);

-- 4. Replace travel_moments RLS — simplified via experiences.added_by
DROP POLICY IF EXISTS "travel_moments_select" ON public.travel_moments;
DROP POLICY IF EXISTS "travel_moments_insert" ON public.travel_moments;
DROP POLICY IF EXISTS "travel_moments_update" ON public.travel_moments;
DROP POLICY IF EXISTS "travel_moments_delete" ON public.travel_moments;

CREATE POLICY "travel_moments_select" ON public.travel_moments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.experiences WHERE id = travel_moments.experience_id AND added_by = auth.uid())
);
CREATE POLICY "travel_moments_insert" ON public.travel_moments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.experiences WHERE id = travel_moments.experience_id AND added_by = auth.uid())
);
CREATE POLICY "travel_moments_update" ON public.travel_moments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.experiences WHERE id = travel_moments.experience_id AND added_by = auth.uid())
);
CREATE POLICY "travel_moments_delete" ON public.travel_moments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.experiences WHERE id = travel_moments.experience_id AND added_by = auth.uid())
);

-- 5. Add index on added_by for fast personal feed
CREATE INDEX IF NOT EXISTS idx_experiences_added_by ON public.experiences(added_by);
