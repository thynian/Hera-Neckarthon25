-- Ensure audio-files bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('audio-files', 'audio-files', true, 52428800, ARRAY['audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/wav'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access for Audio Files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload audio files" ON storage.objects;

-- Create policy for public read access to audio-files bucket
CREATE POLICY "Public Access for Audio Files"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-files');

-- Create policy for authenticated upload to audio-files bucket
CREATE POLICY "Anyone can upload audio files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio-files');