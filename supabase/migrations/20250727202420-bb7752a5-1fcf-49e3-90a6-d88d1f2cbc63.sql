-- Create points system table
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own points" 
ON public.user_points 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create point records" 
ON public.user_points 
FOR INSERT 
WITH CHECK (true);

-- Add total_points to profiles table
ALTER TABLE public.profiles 
ADD COLUMN total_points INTEGER DEFAULT 0;

-- Create function to update user total points
CREATE OR REPLACE FUNCTION public.update_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET total_points = total_points + NEW.points 
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET total_points = total_points - OLD.points 
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic points calculation
CREATE TRIGGER update_user_points_total
AFTER INSERT OR DELETE ON public.user_points
FOR EACH ROW
EXECUTE FUNCTION public.update_user_total_points();