CREATE TABLE public.portfolio_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  caption TEXT,
  image_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT portfolio_photos_title_length CHECK (char_length(title) BETWEEN 1 AND 160),
  CONSTRAINT portfolio_photos_location_length CHECK (location IS NULL OR char_length(location) <= 160),
  CONSTRAINT portfolio_photos_caption_length CHECK (caption IS NULL OR char_length(caption) <= 1000),
  CONSTRAINT portfolio_photos_image_path_length CHECK (char_length(image_path) BETWEEN 1 AND 500),
  CONSTRAINT portfolio_photos_image_url_length CHECK (char_length(image_url) BETWEEN 1 AND 1000)
);

ALTER TABLE public.portfolio_photos ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_portfolio_photos_user_id ON public.portfolio_photos(user_id);
CREATE INDEX idx_portfolio_photos_published_sort_order ON public.portfolio_photos(is_published, sort_order, created_at DESC);

CREATE POLICY "Public can view published portfolio photos"
ON public.portfolio_photos
FOR SELECT
USING (is_published = true);

CREATE POLICY "Users can view their own portfolio photos"
ON public.portfolio_photos
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio photos"
ON public.portfolio_photos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio photos"
ON public.portfolio_photos
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio photos"
ON public.portfolio_photos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_portfolio_photos_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_portfolio_photos_updated_at
BEFORE UPDATE ON public.portfolio_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_portfolio_photos_updated_at();

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-photos', 'portfolio-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view portfolio images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'portfolio-photos');

CREATE POLICY "Users can upload their own portfolio images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own portfolio images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'portfolio-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own portfolio images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);