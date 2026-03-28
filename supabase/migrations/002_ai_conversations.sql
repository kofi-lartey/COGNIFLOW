-- ============================================
-- CogniFlow AI Conversations Schema
-- Version: 1.0.0
-- Description: Real-time AI chat with bidirectional communication
-- ============================================

-- AI conversations table (for real-time chat)
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI messages table (for chat messages)
CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  vector_analysis JSONB DEFAULT '{}',
  confidence INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI document context table (for linking documents to conversations)
CREATE TABLE public.ai_document_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3,2) DEFAULT 0.0,
  excerpt TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- AI conversations indexes
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_workspace_id ON public.ai_conversations(workspace_id);
CREATE INDEX idx_ai_conversations_status ON public.ai_conversations(status);
CREATE INDEX idx_ai_conversations_created_at ON public.ai_conversations(created_at DESC);

-- AI messages indexes
CREATE INDEX idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_user_id ON public.ai_messages(user_id);
CREATE INDEX idx_ai_messages_role ON public.ai_messages(role);
CREATE INDEX idx_ai_messages_created_at ON public.ai_messages(created_at DESC);

-- AI document context indexes
CREATE INDEX idx_ai_document_context_conversation_id ON public.ai_document_context(conversation_id);
CREATE INDEX idx_ai_document_context_document_id ON public.ai_document_context(document_id);
CREATE INDEX idx_ai_document_context_relevance_score ON public.ai_document_context(relevance_score DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_document_context ENABLE ROW LEVEL SECURITY;

-- AI conversations policies
CREATE POLICY "Users can view own ai conversations" ON public.ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create ai conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai conversations" ON public.ai_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai conversations" ON public.ai_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- AI messages policies
CREATE POLICY "Users can view own ai messages" ON public.ai_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create ai messages" ON public.ai_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai messages" ON public.ai_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai messages" ON public.ai_messages
  FOR DELETE USING (auth.uid() = user_id);

-- AI document context policies
CREATE POLICY "Users can view own ai document context" ON public.ai_document_context
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_document_context.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ai document context" ON public.ai_document_context
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_document_context.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own ai document context" ON public.ai_document_context
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_document_context.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get or create active conversation for user
CREATE OR REPLACE FUNCTION public.get_or_create_active_conversation(p_user_id UUID, p_workspace_id UUID DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to get existing active conversation
  SELECT id INTO v_conversation_id
  FROM public.ai_conversations
  WHERE user_id = p_user_id
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id)
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no active conversation, create one
  IF v_conversation_id IS NULL THEN
    INSERT INTO public.ai_conversations (user_id, workspace_id, title)
    VALUES (p_user_id, p_workspace_id, 'AI Chat')
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add message to conversation
CREATE OR REPLACE FUNCTION public.add_ai_message(
  p_conversation_id UUID,
  p_user_id UUID,
  p_role TEXT,
  p_content TEXT,
  p_sources JSONB DEFAULT '[]',
  p_vector_analysis JSONB DEFAULT '{}',
  p_confidence INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
BEGIN
  INSERT INTO public.ai_messages (
    conversation_id,
    user_id,
    role,
    content,
    sources,
    vector_analysis,
    confidence,
    metadata
  )
  VALUES (
    p_conversation_id,
    p_user_id,
    p_role,
    p_content,
    p_sources,
    p_vector_analysis,
    p_confidence,
    p_metadata
  )
  RETURNING id INTO v_message_id;

  -- Update conversation updated_at
  UPDATE public.ai_conversations
  SET updated_at = NOW()
  WHERE id = p_conversation_id;

  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation messages with pagination
CREATE OR REPLACE FUNCTION public.get_conversation_messages(
  p_conversation_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  role TEXT,
  content TEXT,
  sources JSONB,
  vector_analysis JSONB,
  confidence INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.role,
    m.content,
    m.sources,
    m.vector_analysis,
    m.confidence,
    m.metadata,
    m.created_at
  FROM public.ai_messages m
  WHERE m.conversation_id = p_conversation_id
  ORDER BY m.created_at ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search documents for RAG context
CREATE OR REPLACE FUNCTION public.search_documents_for_rag(
  p_user_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  relevance_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.content,
    -- Simple relevance scoring based on text similarity
    CASE
      WHEN d.content ILIKE '%' || p_query || '%' THEN 1.0
      WHEN d.title ILIKE '%' || p_query || '%' THEN 0.8
      ELSE 0.5
    END AS relevance_score
  FROM public.documents d
  WHERE d.user_id = p_user_id
    AND d.status = 'completed'
    AND (
      d.content ILIKE '%' || p_query || '%'
      OR d.title ILIKE '%' || p_query || '%'
    )
  ORDER BY relevance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
