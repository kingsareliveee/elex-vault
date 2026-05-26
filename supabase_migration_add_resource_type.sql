-- Migration: Add resource_type column to elex_papers
ALTER TABLE elex_papers ADD COLUMN resource_type TEXT CHECK (resource_type IN ('mst_1', 'mst_2', 'mst_3', 'endsem', 'syllabus', 'assignment'));
-- Optionally, set a default value for existing rows if needed:
-- UPDATE elex_papers SET resource_type = 'endsem' WHERE resource_type IS NULL;