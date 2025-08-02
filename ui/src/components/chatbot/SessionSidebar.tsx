'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  X,
  MoreVertical,
  Clock,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { ChatSession, chatStorage } from '@/lib/chat-storage';
import { cn } from '@/lib/utils';

interface SessionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSessionId: string;
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
  refreshTrigger?: number; // Add this to trigger refresh from parent
}

export default function SessionSidebar({
  isOpen,
  onClose,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  refreshTrigger
}: SessionSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  // Refresh sessions when sidebar opens or when refreshTrigger changes
  useEffect(() => {
    if (isOpen || refreshTrigger) {
      loadSessions();
    }
  }, [isOpen, refreshTrigger]);

  const loadSessions = () => {
    const allSessions = chatStorage.getSessions();
    setSessions(allSessions);
  };

  const handleNewSession = () => {
    const newSession = chatStorage.createSession();
    onNewSession();
    onSessionSelect(newSession);
    loadSessions();
  };

  const handleDeleteSession = (sessionId: string) => {
    const sessions = chatStorage.getSessions();
    
    // Don't delete if it's the last session
    if (sessions.length <= 1) {
      return;
    }
    
    if (sessionId === currentSessionId) {
      // If deleting current session, switch to the first available session
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        onSessionSelect(remainingSessions[0]);
      } else {
        // If no sessions left, create a new one
        const newSession = chatStorage.createSession();
        onSessionSelect(newSession);
      }
    }
    
    chatStorage.deleteSession(sessionId);
    loadSessions();
    setSessionToDelete(null);
  };

  const confirmDeleteSession = (sessionId: string) => {
    const sessions = chatStorage.getSessions();
    
    // Don't allow deletion if it's the last session
    if (sessions.length <= 1) {
      return;
    }
    
    setSessionToDelete(sessionId);
  };

  const handleClearAllSessions = () => {
    chatStorage.clearAllSessions();
    const newSession = chatStorage.createSession();
    onSessionSelect(newSession);
    loadSessions();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
  };

  const sessionsCount = sessions.length;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 max-w-sm w-full border border-border/50 shadow-lg">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold">Delete Session</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this chat session? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setSessionToDelete(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteSession(sessionToDelete)}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border/40 z-50",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? 'translate-x-0' : '-translate-x-full',
        "lg:relative lg:translate-x-0 lg:z-0 lg:border-r-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/20">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-foreground">Chat Sessions</h2>
              <Badge variant="secondary" className="text-xs">
                {sessionsCount}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewSession}
                className="h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors"
                title="New Chat"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {sessionsCount > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearAllSessions}
                  className="h-8 w-8 hover:bg-red-100 text-red-600 transition-colors"
                  title="Clear All Sessions"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 lg:hidden hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No chat sessions yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewSession}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group relative p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer",
                    session.id === currentSessionId && "bg-accent border-accent/50 shadow-sm"
                  )}
                  onClick={() => onSessionSelect(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {truncateTitle(session.title)}
                        </h3>
                        {session.id === currentSessionId && (
                          <Badge variant="default" className="text-xs px-1.5 py-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(session.updatedAt)}</span>
                        <span>•</span>
                        <span>{session.messages.length} messages</span>
                      </div>
                    </div>
                    
                    {/* Action Menu */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteSession(session.id);
                        }}
                        title="Delete Session"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/40 bg-muted/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Doraemon AI</span>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 