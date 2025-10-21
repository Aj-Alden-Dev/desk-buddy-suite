-- Phase 1: Enhanced Ticketing System

-- Create ticket notes table for internal and public comments
CREATE TABLE public.ticket_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ticket activity/history table
CREATE TABLE public.ticket_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL, -- 'status_change', 'assignment', 'priority_change', 'note_added', etc.
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create SLA policies table
CREATE TABLE public.sla_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL, -- 'low', 'medium', 'high', 'urgent'
  first_response_time_minutes INTEGER NOT NULL, -- minutes to first response
  resolution_time_minutes INTEGER NOT NULL, -- minutes to resolution
  business_hours_only BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add SLA tracking fields to tickets table
ALTER TABLE public.tickets ADD COLUMN sla_policy_id UUID REFERENCES public.sla_policies(id);
ALTER TABLE public.tickets ADD COLUMN first_response_at TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN first_response_due_at TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN resolution_due_at TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN resolved_at TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN sla_breached BOOLEAN DEFAULT false;
ALTER TABLE public.tickets ADD COLUMN tags TEXT[];

-- Enable RLS
ALTER TABLE public.ticket_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ticket_notes
CREATE POLICY "Authenticated users can view notes" ON public.ticket_notes
  FOR SELECT USING (
    has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role, 'light_agent'::app_role, 'viewer'::app_role])
  );

CREATE POLICY "Agents can create notes" ON public.ticket_notes
  FOR INSERT WITH CHECK (
    has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role, 'light_agent'::app_role])
  );

CREATE POLICY "Agents can update their notes" ON public.ticket_notes
  FOR UPDATE USING (
    user_id = auth.uid() AND has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role, 'light_agent'::app_role])
  );

-- RLS Policies for ticket_activities
CREATE POLICY "Authenticated users can view activities" ON public.ticket_activities
  FOR SELECT USING (
    has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role, 'light_agent'::app_role, 'viewer'::app_role])
  );

CREATE POLICY "System can create activities" ON public.ticket_activities
  FOR INSERT WITH CHECK (true);

-- RLS Policies for sla_policies
CREATE POLICY "Everyone can view SLA policies" ON public.sla_policies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage SLA policies" ON public.sla_policies
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Triggers
CREATE TRIGGER update_ticket_notes_updated_at
  BEFORE UPDATE ON public.ticket_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sla_policies_updated_at
  BEFORE UPDATE ON public.sla_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default SLA policies
INSERT INTO public.sla_policies (name, description, priority, first_response_time_minutes, resolution_time_minutes, business_hours_only) VALUES
  ('Low Priority SLA', 'Standard response for low priority tickets', 'low', 1440, 10080, true), -- 24h response, 7 days resolution
  ('Medium Priority SLA', 'Standard response for medium priority tickets', 'medium', 480, 2880, true), -- 8h response, 2 days resolution
  ('High Priority SLA', 'Expedited response for high priority tickets', 'high', 120, 1440, true), -- 2h response, 1 day resolution
  ('Urgent Priority SLA', 'Immediate response for urgent tickets', 'urgent', 30, 480, false); -- 30min response, 8h resolution

-- Phase 2: Knowledge Base

-- Create knowledge base categories
CREATE TABLE public.kb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.kb_categories(id) ON DELETE CASCADE,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create knowledge base articles
CREATE TABLE public.kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID REFERENCES public.kb_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  tags TEXT[],
  search_vector tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Create article versions for tracking changes
CREATE TABLE public.kb_article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create article feedback table
CREATE TABLE public.kb_article_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kb_categories
CREATE POLICY "Everyone can view active categories" ON public.kb_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins and agents can manage categories" ON public.kb_categories
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role]));

-- RLS Policies for kb_articles
CREATE POLICY "Public articles are viewable by everyone" ON public.kb_articles
  FOR SELECT USING (status = 'published' AND is_public = true);

CREATE POLICY "Authenticated users can view internal articles" ON public.kb_articles
  FOR SELECT USING (
    status = 'published' AND (is_public = true OR has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role, 'light_agent'::app_role, 'viewer'::app_role]))
  );

CREATE POLICY "Agents can create articles" ON public.kb_articles
  FOR INSERT WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role]));

CREATE POLICY "Authors can update their articles" ON public.kb_articles
  FOR UPDATE USING (
    author_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for kb_article_versions
CREATE POLICY "Users can view article versions" ON public.kb_article_versions
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role]));

CREATE POLICY "System can create versions" ON public.kb_article_versions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for kb_article_feedback
CREATE POLICY "Users can view feedback" ON public.kb_article_feedback
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role]));

CREATE POLICY "Anyone can submit feedback" ON public.kb_article_feedback
  FOR INSERT WITH CHECK (true);

-- Create full-text search index
CREATE INDEX kb_articles_search_idx ON public.kb_articles USING GIN(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION public.kb_articles_search_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kb_articles_search_update
  BEFORE INSERT OR UPDATE ON public.kb_articles
  FOR EACH ROW EXECUTE FUNCTION public.kb_articles_search_trigger();

-- Triggers
CREATE TRIGGER update_kb_categories_updated_at
  BEFORE UPDATE ON public.kb_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON public.kb_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample KB categories
INSERT INTO public.kb_categories (name, description, icon, display_order) VALUES
  ('Getting Started', 'Basic guides and tutorials', 'BookOpen', 1),
  ('Account Management', 'Managing your account and settings', 'User', 2),
  ('Troubleshooting', 'Common issues and solutions', 'AlertCircle', 3),
  ('FAQs', 'Frequently asked questions', 'HelpCircle', 4);

-- Phase 3: Communications Setup (Tables for call records)

-- Create call records table
CREATE TABLE public.call_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  call_type TEXT NOT NULL, -- 'inbound', 'outbound'
  phone_number TEXT,
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT,
  call_status TEXT NOT NULL, -- 'completed', 'missed', 'voicemail', 'failed'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view call records" ON public.call_records
  FOR SELECT USING (
    has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role, 'light_agent'::app_role, 'viewer'::app_role])
  );

CREATE POLICY "Agents can create call records" ON public.call_records
  FOR INSERT WITH CHECK (
    has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role])
  );

-- Phase 4: Analytics & Reporting

-- Create ticket metrics view
CREATE OR REPLACE VIEW public.ticket_metrics AS
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

-- Create agent performance view
CREATE OR REPLACE VIEW public.agent_performance AS
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

-- Phase 5: Advanced Features Setup

-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'ticket_created', 'ticket_updated', 'ticket_resolved', 'auto_response'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create automation rules table
CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL, -- 'ticket_created', 'ticket_updated', 'sla_breach'
  conditions JSONB, -- flexible conditions storage
  actions JSONB, -- actions to perform
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'ticket', 'user', 'department', etc.
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Agents can view email templates" ON public.email_templates
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role]));

CREATE POLICY "Super admins can manage email templates" ON public.email_templates
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Agents can view automation rules" ON public.automation_rules
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'agent'::app_role]));

CREATE POLICY "Super admins can manage automation rules" ON public.automation_rules
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can create audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Triggers
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_ticket_notes_ticket_id ON public.ticket_notes(ticket_id);
CREATE INDEX idx_ticket_activities_ticket_id ON public.ticket_activities(ticket_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_tickets_assigned_agent ON public.tickets(assigned_agent_id);
CREATE INDEX idx_tickets_department ON public.tickets(department_id);
CREATE INDEX idx_tickets_sla_due ON public.tickets(resolution_due_at);
CREATE INDEX idx_kb_articles_category ON public.kb_articles(category_id);
CREATE INDEX idx_kb_articles_status ON public.kb_articles(status);
CREATE INDEX idx_call_records_ticket ON public.call_records(ticket_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);