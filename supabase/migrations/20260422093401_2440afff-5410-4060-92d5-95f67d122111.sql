DROP POLICY IF EXISTS "Public can view portfolio images" ON storage.objects;

CREATE OR REPLACE FUNCTION public.is_public_portfolio_image(_path text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.portfolio_photos
    WHERE image_path = _path
      AND is_published = true
  );
$$;

CREATE POLICY "Public can view published portfolio images only"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'portfolio-photos'
  AND public.is_public_portfolio_image(name)
);