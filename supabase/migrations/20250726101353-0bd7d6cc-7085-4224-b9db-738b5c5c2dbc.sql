-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.update_connection_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix photo likes count function
CREATE OR REPLACE FUNCTION public.update_photo_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;