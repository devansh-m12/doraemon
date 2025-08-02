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
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-r border-border/50 shadow-xl",
        "dark:bg-background/98 dark:border-border/60 dark:shadow-2xl dark:shadow-black/20",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border/40 px-4 dark:border-border/60">
          <h2 className="text-lg font-semibold text-foreground dark:text-foreground">Chat History</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/80 dark:hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* New Session Button */}
          <div className="p-4 border-b border-border/40 dark:border-border/60">
            <Button
              onClick={handleNewSession}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Sessions List */}
          <div className="p-4 space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground dark:text-muted-foreground/80">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50 dark:text-muted-foreground/30" />
                <p className="text-sm">No chat history</p>
                <p className="text-xs">Start a new conversation to see it here</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group relative rounded-lg border border-border/50 p-3 cursor-pointer transition-all duration-200",
                    "hover:bg-accent/50 hover:border-border/70",
                    "dark:border-border/60 dark:hover:bg-accent/30 dark:hover:border-border/80",
                    session.id === currentSessionId && "bg-accent/50 border-primary/50 dark:bg-accent/30 dark:border-primary/60"
                  )}
                  onClick={() => onSessionSelect(session)}
                >
                  {/* Session Content */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/80" />
                        <h3 className="text-sm font-medium text-foreground dark:text-foreground truncate">
                          {truncateTitle(session.title || 'Untitled Chat')}
                        </h3>
                        {session.id === currentSessionId && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                            Current
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground/80">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(session.createdAt)}</span>
                        {session.messages.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{session.messages.length} messages</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive dark:text-muted-foreground/80 dark:hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteSession(session.id);
                        }}
                        title="Delete session"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        {sessions.length > 1 && (
          <div className="border-t border-border/40 p-4 dark:border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllSessions}
              className="w-full text-destructive hover:text-destructive dark:text-destructive dark:hover:text-destructive"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Clear All History
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background dark:bg-background/95 rounded-lg border border-border/50 dark:border-border/60 p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground dark:text-foreground">Delete Session</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
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
    </>
  );
} 