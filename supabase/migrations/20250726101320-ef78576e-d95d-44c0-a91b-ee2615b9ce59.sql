-- Create user connections/following system
CREATE TABLE public.user_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for user connections
CREATE POLICY "Users can view connections involving them" 
ON public.user_connections 
FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create connections" 
ON public.user_connections 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update their own connection requests" 
ON public.user_connections 
FOR UPDATE 
USING (auth.uid() = following_id OR auth.uid() = follower_id);

CREATE POLICY "Users can delete their connections" 
ON public.user_connections 
FOR DELETE 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Add columns to profiles for social features
ALTER TABLE public.profiles 
ADD COLUMN bio TEXT,
ADD COLUMN followers_count INTEGER DEFAULT 0,
ADD COLUMN following_count INTEGER DEFAULT 0,
ADD COLUMN posts_count INTEGER DEFAULT 0;

-- Update photos table to support user posts (not just event photos)
ALTER TABLE public.photos 
ADD COLUMN caption TEXT,
ADD COLUMN is_profile_photo BOOLEAN DEFAULT false,
ADD COLUMN likes_count INTEGER DEFAULT 0;

-- Create likes table for photos
CREATE TABLE public.photo_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(photo_id, user_id)
);

-- Enable RLS for photo likes
ALTER TABLE public.photo_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for photo likes
CREATE POLICY "Anyone can view photo likes" 
ON public.photo_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can like photos" 
ON public.photo_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike photos" 
ON public.photo_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to update followers count
CREATE OR REPLACE FUNCTION public.update_connection_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    -- Update follower's following count
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
    -- Update following's followers count
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE user_id = NEW.following_id;
    
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    -- Update follower's following count
    UPDATE public.profiles 
    SET following_count = GREATEST(following_count - 1, 0) 
    WHERE user_id = OLD.follower_id;
    
    -- Update following's followers count
    UPDATE public.profiles 
    SET followers_count = GREATEST(followers_count - 1, 0) 
    WHERE user_id = OLD.following_id;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
      -- Connection accepted
      UPDATE public.profiles 
      SET following_count = following_count + 1 
      WHERE user_id = NEW.follower_id;
      
      UPDATE public.profiles 
      SET followers_count = followers_count + 1 
      WHERE user_id = NEW.following_id;
    ELSIF NEW.status = 'pending' AND OLD.status = 'accepted' THEN
      -- Connection unaccepted
      UPDATE public.profiles 
      SET following_count = GREATEST(following_count - 1, 0) 
      WHERE user_id = NEW.follower_id;
      
      UPDATE public.profiles 
      SET followers_count = GREATEST(followers_count - 1, 0) 
      WHERE user_id = NEW.following_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for connection counts
CREATE TRIGGER update_user_connection_counts
AFTER INSERT OR UPDATE OR DELETE ON public.user_connections
FOR EACH ROW EXECUTE FUNCTION public.update_connection_counts();

-- Function to update photo likes count
CREATE OR REPLACE FUNCTION public.update_photo_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.photos 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.photo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.photos 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.photo_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for photo likes count
CREATE TRIGGER update_photo_likes_count_trigger
AFTER INSERT OR DELETE ON public.photo_likes
FOR EACH ROW EXECUTE FUNCTION public.update_photo_likes_count();