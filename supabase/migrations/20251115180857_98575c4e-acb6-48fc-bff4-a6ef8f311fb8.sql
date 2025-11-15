-- Add curatedTopics field to documentations table
ALTER TABLE public.documentations 
ADD COLUMN curated_topics JSONB DEFAULT '[]'::jsonb;