-- Music table setup for Supabase
-- 鋒兄音樂庫表格設定

-- Create music table
CREATE TABLE IF NOT EXISTS public.music (
  id bigserial NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  name character varying(100) NOT NULL,
  file character varying(150) NULL,
  filetype character varying(20) NULL,
  note character varying(100) NULL,
  ref character varying(100) NULL,
  category character varying(100) NULL,
  hash character varying(300) NULL,
  cover character varying(150) NULL,
  CONSTRAINT music_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_music_name ON public.music(name);
CREATE INDEX IF NOT EXISTS idx_music_category ON public.music(category);
CREATE INDEX IF NOT EXISTS idx_music_created_at ON public.music(created_at);
CREATE INDEX IF NOT EXISTS idx_music_hash ON public.music(hash);

-- Enable Row Level Security (optional - currently disabled for testing)
-- ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (when RLS is enabled)
-- CREATE POLICY "Allow all operations on music" ON public.music
-- FOR ALL USING (true) WITH CHECK (true);

-- Verify table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'music' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Insert sample data (optional)
INSERT INTO public.music (name, file, filetype, note, category) VALUES
('Sample Song 1', '/music/song1.mp3', 'mp3', 'Test music track', 'pop'),
('Sample Song 2', '/music/song2.mp3', 'mp3', 'Another track', 'rock')
ON CONFLICT DO NOTHING;

-- Query the table
SELECT * FROM public.music ORDER BY created_at DESC;
