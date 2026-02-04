-- Image table setup for Supabase
-- 鋒兄圖庫表格設定

-- Create image table
CREATE TABLE IF NOT EXISTS public.image (
  id bigserial NOT NULL,
  name character varying(100) NOT NULL,
  file character varying(150) NULL,
  filetype character varying(20) NULL,
  note character varying(100) NULL,
  ref character varying(100) NULL,
  category character varying(100) NULL,
  hash character varying(300) NULL,
  cover character varying(150) NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT image_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_image_name ON public.image(name);
CREATE INDEX IF NOT EXISTS idx_image_category ON public.image(category);
CREATE INDEX IF NOT EXISTS idx_image_created_at ON public.image(created_at);
CREATE INDEX IF NOT EXISTS idx_image_hash ON public.image(hash);

-- Enable Row Level Security (optional - currently disabled for testing)
-- ALTER TABLE public.image ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (when RLS is enabled)
-- CREATE POLICY "Allow all operations on image" ON public.image
-- FOR ALL USING (true) WITH CHECK (true);

-- Verify table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'image' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Insert sample data (optional)
INSERT INTO public.image (name, file, filetype, note, category) VALUES
('Sample Image 1', '/images/sample1.jpg', 'jpg', 'Test image', 'general'),
('Sample Image 2', '/images/sample2.png', 'png', 'Another test', 'general')
ON CONFLICT DO NOTHING;

-- Query the table
SELECT * FROM public.image ORDER BY created_at DESC;
