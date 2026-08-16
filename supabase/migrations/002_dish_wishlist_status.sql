-- Migration: Add 'wishlist' as a valid dish status
-- Run this in Supabase SQL Editor

ALTER TABLE public.dishes
  DROP CONSTRAINT IF EXISTS dishes_status_check;

ALTER TABLE public.dishes
  ADD CONSTRAINT dishes_status_check
  CHECK (status IN ('active', 'memory_only', 'archived', 'wishlist'));
