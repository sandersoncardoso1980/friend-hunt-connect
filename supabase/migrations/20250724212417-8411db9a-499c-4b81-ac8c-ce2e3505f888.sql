-- Create users table (additional user info beyond auth.users)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  city TEXT DEFAULT 'São Paulo',
  interests TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policies for users
CREATE POLICY "Users can view all profiles" 
ON public.users 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = auth_user_id);

-- Update existing events table to match requirements (only add missing columns)
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add foreign key for created_by if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'events_created_by_fkey'
    ) THEN
        ALTER TABLE public.events 
        ADD CONSTRAINT events_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
    END IF;
END $$;

-- Create locations table
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  address TEXT,
  city TEXT,
  image_url TEXT,
  partner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for locations
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- RLS policies for locations
CREATE POLICY "Anyone can view locations" 
ON public.locations 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create locations" 
ON public.locations 
FOR INSERT 
WITH CHECK (auth.uid() = partner_id);

-- Create photos table
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for photos
CREATE POLICY "Users can view all photos" 
ON public.photos 
FOR SELECT 
USING (true);

CREATE POLICY "Users can upload their own photos" 
ON public.photos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" 
ON public.photos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create ads_carousel table
CREATE TABLE public.ads_carousel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_from DATE NOT NULL,
  display_to DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for ads_carousel
ALTER TABLE public.ads_carousel ENABLE ROW LEVEL SECURITY;

-- RLS policies for ads_carousel
CREATE POLICY "Anyone can view active ads" 
ON public.ads_carousel 
FOR SELECT 
USING (
  display_from <= CURRENT_DATE AND 
  display_to >= CURRENT_DATE
);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, name, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', 'São Paulo')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();