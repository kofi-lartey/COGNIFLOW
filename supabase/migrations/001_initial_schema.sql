-- ============================================
-- CogniFlow Database Schema for Supabase
-- Version: 1.0.0
-- Description: Complete schema with RLS policies
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  organization TEXT,
  bio TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,
  workspace_name TEXT,
  workspace_id UUID,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'none')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'paused')),
  plan_id TEXT,
  amount INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  ai_model TEXT DEFAULT 'Xenova/distilbart-cnn-12-6',
  storage_used BIGINT DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table (uploaded files)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'video', 'audio', 'text')),
  file_size BIGINT DEFAULT 0,
  cloudinary_url TEXT,
  cloudinary_public_id TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'queued')),
  content TEXT,
  summary TEXT,
  metadata JSONB DEFAULT '{}',
  word_count INTEGER DEFAULT 0,
  page_count INTEGER,
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  persona TEXT DEFAULT 'teen' CHECK (persona IN ('kid', 'teen', 'expert')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  total_questions INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study guides table
CREATE TABLE public.study_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]',
  persona TEXT DEFAULT 'teen' CHECK (persona IN ('kid', 'teen', 'expert')),
  duration INTEGER DEFAULT 7 CHECK (duration IN (3, 7)),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Summaries table
CREATE TABLE public.summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  key_points JSONB DEFAULT '[]',
  persona TEXT DEFAULT 'teen' CHECK (persona IN ('kid', 'teen', 'expert')),
  word_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Processing jobs table (for tracking async operations)
CREATE TABLE public.processing_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('ingest', 'summarize', 'quiz', 'study_guide', 'full_pipeline')),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Neural file items table (for dashboard tracking)
CREATE TABLE public.neural_file_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'video', 'audio', 'text')),
  status TEXT DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'FETCHING', 'VECTORIZING', 'ANALYZING', 'COMPLETE', 'ERROR')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  message TEXT DEFAULT 'Ready to process',
  processing_time_ms INTEGER,
  result JSONB,
  learning_path JSONB,
  error TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning paths table
CREATE TABLE public.learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL CHECK (duration IN (3, 7)),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  days JSONB NOT NULL DEFAULT '[]',
  persona TEXT DEFAULT 'teen' CHECK (persona IN ('kid', 'teen', 'expert')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI insights table (for RAG context storage)
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  vector_analysis JSONB DEFAULT '{}',
  confidence INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_workspace_id ON public.profiles(workspace_id);
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- Workspaces indexes
CREATE INDEX idx_workspaces_owner_id ON public.workspaces(owner_id);
CREATE INDEX idx_workspaces_organization_id ON public.workspaces(organization_id);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_workspace_id ON public.subscriptions(workspace_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);

-- Projects indexes
CREATE INDEX idx_projects_workspace_id ON public.projects(workspace_id);
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_status ON public.projects(status);

-- Documents indexes
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_workspace_id ON public.documents(workspace_id);
CREATE INDEX idx_documents_project_id ON public.documents(project_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_file_type ON public.documents(file_type);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);

-- Quizzes indexes
CREATE INDEX idx_quizzes_document_id ON public.quizzes(document_id);
CREATE INDEX idx_quizzes_user_id ON public.quizzes(user_id);

-- Study guides indexes
CREATE INDEX idx_study_guides_document_id ON public.study_guides(document_id);
CREATE INDEX idx_study_guides_user_id ON public.study_guides(user_id);

-- Summaries indexes
CREATE INDEX idx_summaries_document_id ON public.summaries(document_id);
CREATE INDEX idx_summaries_user_id ON public.summaries(user_id);

-- Processing jobs indexes
CREATE INDEX idx_processing_jobs_document_id ON public.processing_jobs(document_id);
CREATE INDEX idx_processing_jobs_user_id ON public.processing_jobs(user_id);
CREATE INDEX idx_processing_jobs_status ON public.processing_jobs(status);
CREATE INDEX idx_processing_jobs_created_at ON public.processing_jobs(created_at DESC);

-- Neural file items indexes
CREATE INDEX idx_neural_file_items_user_id ON public.neural_file_items(user_id);
CREATE INDEX idx_neural_file_items_workspace_id ON public.neural_file_items(workspace_id);
CREATE INDEX idx_neural_file_items_document_id ON public.neural_file_items(document_id);
CREATE INDEX idx_neural_file_items_status ON public.neural_file_items(status);

-- Learning paths indexes
CREATE INDEX idx_learning_paths_document_id ON public.learning_paths(document_id);
CREATE INDEX idx_learning_paths_user_id ON public.learning_paths(user_id);

-- AI insights indexes
CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_workspace_id ON public.ai_insights(workspace_id);
CREATE INDEX idx_ai_insights_document_id ON public.ai_insights(document_id);
CREATE INDEX idx_ai_insights_created_at ON public.ai_insights(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neural_file_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Workspaces policies
CREATE POLICY "Users can view own workspaces" ON public.workspaces
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own workspaces" ON public.workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own workspaces" ON public.workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscription" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = owner_id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Quizzes policies
CREATE POLICY "Users can view own quizzes" ON public.quizzes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes" ON public.quizzes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quizzes" ON public.quizzes
  FOR DELETE USING (auth.uid() = user_id);

-- Study guides policies
CREATE POLICY "Users can view own study guides" ON public.study_guides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create study guides" ON public.study_guides
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study guides" ON public.study_guides
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study guides" ON public.study_guides
  FOR DELETE USING (auth.uid() = user_id);

-- Summaries policies
CREATE POLICY "Users can view own summaries" ON public.summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create summaries" ON public.summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summaries" ON public.summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own summaries" ON public.summaries
  FOR DELETE USING (auth.uid() = user_id);

-- Processing jobs policies
CREATE POLICY "Users can view own processing jobs" ON public.processing_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create processing jobs" ON public.processing_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own processing jobs" ON public.processing_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own processing jobs" ON public.processing_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Neural file items policies
CREATE POLICY "Users can view own neural file items" ON public.neural_file_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create neural file items" ON public.neural_file_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own neural file items" ON public.neural_file_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own neural file items" ON public.neural_file_items
  FOR DELETE USING (auth.uid() = user_id);

-- Learning paths policies
CREATE POLICY "Users can view own learning paths" ON public.learning_paths
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create learning paths" ON public.learning_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning paths" ON public.learning_paths
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own learning paths" ON public.learning_paths
  FOR DELETE USING (auth.uid() = user_id);

-- AI insights policies
CREATE POLICY "Users can view own ai insights" ON public.ai_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create ai insights" ON public.ai_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai insights" ON public.ai_insights
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_guides_updated_at
  BEFORE UPDATE ON public.study_guides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_summaries_updated_at
  BEFORE UPDATE ON public.summaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_processing_jobs_updated_at
  BEFORE UPDATE ON public.processing_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_neural_file_items_updated_at
  BEFORE UPDATE ON public.neural_file_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Create default subscription
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');
  
  -- Create default workspace
  INSERT INTO public.workspaces (name, owner_id)
  VALUES ('My Workspace', NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create workspace for user
CREATE OR REPLACE FUNCTION public.create_user_workspace(
  workspace_name TEXT
)
RETURNS UUID AS $$
DECLARE
  workspace_id UUID;
BEGIN
  INSERT INTO public.workspaces (name, owner_id)
  VALUES (workspace_name, auth.uid())
  RETURNING id INTO workspace_id;
  
  -- Update profile with workspace_id
  UPDATE public.profiles
  SET workspace_id = workspace_id
  WHERE id = auth.uid();
  
  RETURN workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's document count
CREATE OR REPLACE FUNCTION public.get_user_document_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.documents
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's storage usage
CREATE OR REPLACE FUNCTION public.get_user_storage_usage()
RETURNS BIGINT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(file_size)
     FROM public.documents
     WHERE user_id = auth.uid()),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for user dashboard statistics
CREATE OR REPLACE VIEW public.user_dashboard_stats AS
SELECT
  p.id as user_id,
  p.full_name,
  p.email,
  p.subscription_tier,
  p.subscription_status,
  COUNT(DISTINCT d.id) as total_documents,
  COUNT(DISTINCT CASE WHEN d.status = 'completed' THEN d.id END) as completed_documents,
  COUNT(DISTINCT q.id) as total_quizzes,
  COUNT(DISTINCT sg.id) as total_study_guides,
  COALESCE(SUM(d.file_size), 0) as total_storage_used,
  MAX(d.created_at) as last_upload_date
FROM public.profiles p
LEFT JOIN public.documents d ON p.id = d.user_id
LEFT JOIN public.quizzes q ON p.id = q.user_id
LEFT JOIN public.study_guides sg ON p.id = sg.user_id
GROUP BY p.id, p.full_name, p.email, p.subscription_tier, p.subscription_status;

-- View for recent activity
CREATE OR REPLACE VIEW public.recent_activity AS
SELECT
  'document' as activity_type,
  d.id as item_id,
  d.title as item_name,
  d.user_id,
  d.status,
  d.created_at
FROM public.documents d
UNION ALL
SELECT
  'quiz' as activity_type,
  q.id as item_id,
  q.title as item_name,
  q.user_id,
  'completed' as status,
  q.created_at
FROM public.quizzes q
UNION ALL
SELECT
  'study_guide' as activity_type,
  sg.id as item_id,
  sg.title as item_name,
  sg.user_id,
  'completed' as status,
  sg.created_at
FROM public.study_guides sg
ORDER BY created_at DESC;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Grant permissions on views
GRANT SELECT ON public.user_dashboard_stats TO anon, authenticated;
GRANT SELECT ON public.recent_activity TO anon, authenticated;
