-- Add foreign key relationship from complaints to profiles
ALTER TABLE public.complaints 
DROP CONSTRAINT IF EXISTS complaints_user_id_fkey;

ALTER TABLE public.complaints
ADD CONSTRAINT complaints_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;