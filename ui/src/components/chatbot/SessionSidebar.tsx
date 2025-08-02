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
  AlertTriangle
} from "lucide-react";
import { ChatSession, chatStorage } from '@/lib/chat-storage';

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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold">Delete Session</h3>
            </div>
            <p className="text-gray-600 mb-6">
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
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-0 lg:border-r-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">Chat Sessions</h2>
              <Badge variant="secondary" className="text-xs">
                {sessionsCount}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewSession}
                className="h-8 w-8 hover:bg-gray-200"
                title="New Chat"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {sessionsCount > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearAllSessions}
                  className="h-8 w-8 hover:bg-red-100 text-red-600"
                  title="Clear All Sessions"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 hover:bg-gray-200 lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No chat sessions yet</p>
                <p className="text-xs mt-1">Start a new conversation to get started</p>
              </div>
            ) : sessions.length === 1 ? (
              <div className="space-y-2">
                <div className="text-center py-2 text-xs text-gray-500 bg-blue-50 rounded-lg">
                  <p>This is your only chat session</p>
                  <p className="text-xs mt-1">Create more sessions to organize your conversations</p>
                </div>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      group relative p-3 rounded-lg border cursor-pointer transition-all
                      ${session.id === currentSessionId 
                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                      }
                    `}
                    onClick={() => onSessionSelect(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {truncateTitle(session.title)}
                        </h3>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(session.updatedAt)}
                        </div>
                        {session.messages.length > 0 && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {session.messages.length} messages
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`
                    group relative p-3 rounded-lg border cursor-pointer transition-all
                    ${session.id === currentSessionId 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }
                  `}
                  onClick={() => onSessionSelect(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {truncateTitle(session.title)}
                      </h3>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(session.updatedAt)}
                      </div>
                      {session.messages.length > 0 && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {session.messages.length} messages
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 transition-opacity ${
                        sessionsCount <= 1 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (sessionsCount > 1) {
                          confirmDeleteSession(session.id);
                        }
                      }}
                      disabled={sessionsCount <= 1}
                      title={sessionsCount <= 1 ? "Cannot delete the last session" : "Delete session"}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Button
              variant="outline"
              className="w-full hover:bg-white"
              onClick={handleNewSession}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 