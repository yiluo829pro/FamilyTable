-- Migration: Replace single cuisine_tag with cuisine_tags array
-- Run this in Supabase SQL Editor

ALTER TABLE public.dishes
  ADD COLUMN IF NOT EXISTS cuisine_tags TEXT[] NOT NULL DEFAULT '{}';

-- Copy existing single tag into the new array for existing rows
UPDATE public.dishes
  SET cuisine_tags = ARRAY[cuisine_tag]
  WHERE cuisine_tag IS NOT NULL AND cuisine_tags = '{}';
