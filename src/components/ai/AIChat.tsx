'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  MessageSquare,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAIChat, AIMessage } from '@/hooks/useAIChat';

// ============================================
// Type Definitions
// ============================================

interface AIChatProps {
  workspaceId?: string;
  className?: string;
}

// ============================================
// Sub-Components
// ============================================

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-cyan-400 to-blue-500'
            : 'bg-gradient-to-br from-purple-400 to-pink-500'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-[80%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-cyan-500/10 border border-cyan-500/20 text-white'
              : 'bg-[#0D101A] border border-[#1E253A] text-white'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Sources (for assistant messages) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2 w-full">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-white transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>{message.sources.length} source{message.sources.length > 1 ? 's' : ''}</span>
              {showSources ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            <AnimatePresence>
              {showSources && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-2"
                >
                  {message.sources.map((source, index) => (
                    <div
                      key={index}
                      className="bg-[#0D101A] border border-[#1E253A] rounded-lg p-2 text-xs"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-3 h-3 text-cyan-400" />
                        <span className="font-medium text-white truncate">
                          {source.filename}
                        </span>
                        <span className="text-[#6B7280]">
                          {Math.round(source.relevance * 100)}% match
                        </span>
                      </div>
                      <p className="text-[#9CA3AF] line-clamp-2">{source.excerpt}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Confidence indicator */}
        {!isUser && message.confidence > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-[#6B7280]">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{message.confidence}% confidence</span>
          </div>
        )}

        {/* Timestamp */}
        <span className="mt-1 text-xs text-[#6B7280]">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-[#0D101A] border border-[#1E253A] rounded-2xl px-4 py-3">
        <div className="flex gap-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 bg-[#6B7280] rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 bg-[#6B7280] rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 bg-[#6B7280] rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-400' : 'bg-yellow-400'
        }`}
      />
      <span className="text-[#6B7280]">
        {isConnected ? 'Connected' : 'Connecting...'}
      </span>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function AIChat({ workspaceId, className = '' }: AIChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    conversation,
    isLoading,
    isSending,
    error,
    isConnected,
    sendMessage,
    createNewConversation,
    clearError,
  } = useAIChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create conversation on mount if none exists
  useEffect(() => {
    if (!conversation && !isLoading) {
      createNewConversation(workspaceId);
    }
  }, [conversation, isLoading, createNewConversation, workspaceId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSending) {
      return;
    }

    const message = inputValue.trim();
    setInputValue('');
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    await sendMessage(message);
  };

  // Handle textarea input for auto-resize
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#090B13] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1E253A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Assistant</h2>
            <p className="text-xs text-[#6B7280]">
              Ask questions about your documents
            </p>
          </div>
        </div>
        <ConnectionStatus isConnected={isConnected} />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">Loading conversation...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Start a conversation
              </h3>
              <p className="text-sm text-[#6B7280] mb-6">
                Ask questions about your uploaded documents. I'll search through
                your vault and provide answers with source citations.
              </p>
              <div className="space-y-2 text-left">
                <p className="text-xs text-[#6B7280] uppercase tracking-wider font-bold mb-2">
                  Try asking:
                </p>
                <button
                  onClick={() => setInputValue('What are the main topics in my documents?')}
                  className="w-full text-left p-3 bg-[#0D101A] border border-[#1E253A] rounded-lg text-sm text-white hover:border-cyan-400/50 transition-colors"
                >
                  "What are the main topics in my documents?"
                </button>
                <button
                  onClick={() => setInputValue('Summarize the key points from my latest upload')}
                  className="w-full text-left p-3 bg-[#0D101A] border border-[#1E253A] rounded-lg text-sm text-white hover:border-cyan-400/50 transition-colors"
                >
                  "Summarize the key points from my latest upload"
                </button>
                <button
                  onClick={() => setInputValue('Find information about [specific topic]')}
                  className="w-full text-left p-3 bg-[#0D101A] border border-[#1E253A] rounded-lg text-sm text-white hover:border-cyan-400/50 transition-colors"
                >
                  "Find information about [specific topic]"
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>

            {isSending && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-4 mb-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400 flex-1">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 border-t border-[#1E253A]">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              disabled={isSending || !conversation}
              rows={1}
              className="w-full px-4 py-3 bg-[#0D101A] border border-[#1E253A] rounded-xl text-white placeholder:text-[#6B7280] focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/10 outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ maxHeight: '150px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending || !conversation}
            className="px-4 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="mt-2 text-xs text-[#6B7280] text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
