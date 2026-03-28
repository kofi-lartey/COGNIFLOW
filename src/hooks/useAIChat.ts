'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================
// Type Definitions
// ============================================

export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources: SourceCitation[];
  vector_analysis: VectorAnalysis;
  confidence: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SourceCitation {
  source: string;
  filename: string;
  relevance: number;
  excerpt: string;
}

export interface VectorAnalysis {
  vectors: Array<{
    name: string;
    score: number;
    description: string;
  }>;
  primaryVector: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  workspace_id: string | null;
  title: string;
  status: 'active' | 'archived' | 'deleted';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UseAIChatReturn {
  // State
  messages: AIMessage[];
  conversation: AIConversation | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  createNewConversation: (workspaceId?: string) => Promise<void>;
  clearError: () => void;
}

// ============================================
// Main Hook
// ============================================

export function useAIChat(): UseAIChatReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      
      // Unsubscribe from realtime channel
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  // Subscribe to realtime updates for messages
  const subscribeToMessages = useCallback((conversationId: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, realtime updates disabled');
      return;
    }

    // Unsubscribe from previous channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = supabase
      .channel(`ai_messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (!mountedRef.current) return;
          
          const newMessage = payload.new as AIMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((msg) => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (!mountedRef.current) return;
          
          const updatedMessage = payload.new as AIMessage;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe((status) => {
        if (!mountedRef.current) return;
        
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'CHANNEL_ERROR') {
          setError('Realtime connection error');
        }
      });

    channelRef.current = channel;
  }, []);

  // Load conversation and messages
  const loadConversation = useCallback(async (conversationId: string) => {
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get conversation details
      const { data: conversationData, error: conversationError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (conversationError) {
        throw new Error(conversationError.message);
      }

      if (!conversationData) {
        throw new Error('Conversation not found');
      }

      setConversation(conversationData);

      // Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        throw new Error(messagesError.message);
      }

      setMessages(messagesData || []);

      // Subscribe to realtime updates
      subscribeToMessages(conversationId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversation';
      setError(errorMessage);
      console.error('Load conversation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [subscribeToMessages]);

  // Create new conversation
  const createNewConversation = useCallback(async (workspaceId?: string) => {
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          workspace_id: workspaceId || null,
          title: 'New Chat',
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setConversation(data);
      setMessages([]);

      // Subscribe to realtime updates
      subscribeToMessages(data.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation';
      setError(errorMessage);
      console.error('Create conversation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [subscribeToMessages]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      return;
    }

    if (!conversation) {
      setError('No active conversation');
      return;
    }

    if (!content.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Add user message to database
      const { data: userMessage, error: userMessageError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id,
          role: 'user',
          content: content.trim(),
          sources: [],
          vector_analysis: {},
          confidence: 0,
          metadata: {},
        })
        .select()
        .single();

      if (userMessageError) {
        throw new Error(userMessageError.message);
      }

      // Optimistically add user message to UI
      setMessages((prev) => [...prev, userMessage]);

      // Call AI Insight API
      const response = await fetch('/api/ai-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: content.trim(),
          maxSources: 3,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'AI processing failed');
      }

      // Add assistant message to database
      const { data: assistantMessage, error: assistantMessageError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id,
          role: 'assistant',
          content: result.data.answer,
          sources: result.data.sources,
          vector_analysis: result.data.vectorAnalysis,
          confidence: result.data.confidence,
          metadata: {},
        })
        .select()
        .single();

      if (assistantMessageError) {
        throw new Error(assistantMessageError.message);
      }

      // Optimistically add assistant message to UI
      setMessages((prev) => [...prev, assistantMessage]);

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        const title = content.trim().substring(0, 50) + (content.length > 50 ? '...' : '');
        await supabase
          .from('ai_conversations')
          .update({ title })
          .eq('id', conversation.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Send message error:', err);
    } finally {
      setIsSending(false);
    }
  }, [conversation, messages.length]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    conversation,
    isLoading,
    isSending,
    error,
    isConnected,
    sendMessage,
    loadConversation,
    createNewConversation,
    clearError,
  };
}
