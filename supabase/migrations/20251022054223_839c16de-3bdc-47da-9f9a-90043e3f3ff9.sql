-- Fix security warnings from previous migration

-- Fix views - recreate without SECURITY DEFINER by dropping and recreating
DROP VIEW IF EXISTS public.ticket_metrics;
DROP VIEW IF EXISTS public.agent_performance;

-- Recreate ticket metrics view (without SECURITY DEFINER - will use invoker's permissions)
CREATE VIEW public.ticket_metrics
WITH (security_invoker = true)
AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_tickets,
  COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
  COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_tickets,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_tickets,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_tickets,
  COUNT(*) FILTER (WHERE sla_breached = true) as sla_breached_tickets,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_time_hours,
  AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))/60) FILTER (WHERE first_response_at IS NOT NULL) as avg_first_response_time_minutes
FROM public.tickets
GROUP BY DATE(created_at);

-- Recreate agent performance view (without SECURITY DEFINER - will use invoker's permissions)
CREATE VIEW public.agent_performance
WITH (security_invoker = true)
AS
SELECT 
  p.id as agent_id,
  p.full_name as agent_name,
  COUNT(t.id) as total_tickets,
  COUNT(t.id) FILTER (WHERE t.status = 'resolved' OR t.status = 'closed') as resolved_tickets,
  AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))/3600) FILTER (WHERE t.resolved_at IS NOT NULL) as avg_resolution_time_hours,
  COUNT(t.id) FILTER (WHERE t.sla_breached = false AND t.resolved_at IS NOT NULL) as sla_met_tickets,
  COUNT(tn.id) as total_notes
FROM public.profiles p
LEFT JOIN public.tickets t ON t.assigned_agent_id = p.id
LEFT JOIN public.ticket_notes tn ON tn.user_id = p.id
WHERE EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.id 
  AND ur.role IN ('agent', 'light_agent', 'super_admin')
)
GROUP BY p.id, p.full_name;

-- Fix function search paths - update existing functions to set search_path
CREATE OR REPLACE FUNCTION public.kb_articles_search_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$;