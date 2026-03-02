-- Extend pet type constraint to include bird and fish
ALTER TABLE public.pets DROP CONSTRAINT IF EXISTS pets_type_check;
ALTER TABLE public.pets ADD CONSTRAINT pets_type_check
  CHECK (type IN ('dog', 'cat', 'bird', 'fish', 'rabbit', 'other'));
