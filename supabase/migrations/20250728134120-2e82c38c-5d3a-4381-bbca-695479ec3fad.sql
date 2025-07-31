-- Create a cron job that runs every hour to clean up expired events
SELECT cron.schedule(
  'cleanup-expired-events',
  '0 * * * *', -- every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://qiyjfdgdqqwpkumrvodb.supabase.co/functions/v1/cleanup-events',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpeWpmZGdkcXF3cGt1bXJ2b2RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzc4ODMsImV4cCI6MjA2ODkxMzg4M30.p6OhFyNls-N6Sewumb9JQ_DV3v6MHFzj0Ky2HQp6_0o"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);