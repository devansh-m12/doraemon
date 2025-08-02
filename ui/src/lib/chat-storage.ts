export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  type: "user" | "system";
  completed?: boolean;
  newSection?: boolean;
  role?: 'user' | 'assistant';
  timestamp?: Date;
  toolCalls?: any[];
  mermaidCode?: string;
}

class ChatStorageService {
  private readonly STORAGE_KEY = 'doraemon_chat_sessions';
  private readonly MAX_SESSIONS = 50; // Limit to prevent storage bloat
  private readonly MAX_MESSAGES_PER_SESSION = 1000; // Limit messages per session

  // Get all chat sessions
  getSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      
      // Validate and clean the data
      return sessions
        .filter((session: any) => this.validateSession(session))
        .map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages || []
        }));
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  }

  // Validate session data
  private validateSession(session: any): boolean {
    return session && 
           typeof session.id === 'string' && 
           typeof session.title === 'string' &&
           Array.isArray(session.messages) &&
           session.createdAt &&
           session.updatedAt;
  }

  // Get a specific session
  getSession(sessionId: string): ChatSession | null {
    if (!sessionId) return null;
    
    const sessions = this.getSessions();
    return sessions.find(session => session.id === sessionId) || null;
  }

  // Create a new session
  createSession(title?: string): ChatSession {
    const sessions = this.getSessions();
    const timestamp = new Date();
    
    const newSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || "New Chat",
      messages: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    sessions.unshift(newSession);
    
    // Limit the number of sessions
    if (sessions.length > this.MAX_SESSIONS) {
      sessions.splice(this.MAX_SESSIONS);
    }

    this.saveSessions(sessions);
    return newSession;
  }

  // Update a session
  updateSession(sessionId: string, updates: Partial<ChatSession>): void {
    if (!sessionId) return;
    
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(session => session.id === sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...updates,
        updatedAt: new Date()
      };
      this.saveSessions(sessions);
    }
  }

  // Add a message to a session
  addMessage(sessionId: string, message: Message): void {
    if (!sessionId || !message || !message.id) return;
    
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(session => session.id === sessionId);
    
    if (sessionIndex !== -1) {
      // Limit messages per session
      if (sessions[sessionIndex].messages.length >= this.MAX_MESSAGES_PER_SESSION) {
        // Remove oldest messages to make room
        sessions[sessionIndex].messages = sessions[sessionIndex].messages.slice(-this.MAX_MESSAGES_PER_SESSION + 1);
      }
      
      sessions[sessionIndex].messages.push(message);
      sessions[sessionIndex].updatedAt = new Date();
      
      // Update title if it's the first message and no custom title was set
      if (sessions[sessionIndex].messages.length === 1) {
        const messageTitle = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
        sessions[sessionIndex].title = messageTitle;
      }
      
      this.saveSessions(sessions);
    }
  }

  // Update a message in a session
  updateMessage(sessionId: string, messageId: string, updates: Partial<Message>): void {
    if (!sessionId || !messageId) return;
    
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(session => session.id === sessionId);
    
    if (sessionIndex !== -1) {
      const messageIndex = sessions[sessionIndex].messages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        sessions[sessionIndex].messages[messageIndex] = {
          ...sessions[sessionIndex].messages[messageIndex],
          ...updates
        };
        sessions[sessionIndex].updatedAt = new Date();
        this.saveSessions(sessions);
      }
    }
  }

  // Delete a session
  deleteSession(sessionId: string): void {
    if (!sessionId) return;
    
    const sessions = this.getSessions();
    const filteredSessions = sessions.filter(session => session.id !== sessionId);
    this.saveSessions(filteredSessions);
  }

  // Clear all sessions
  clearAllSessions(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing chat sessions:', error);
    }
  }

  // Get session count
  getSessionCount(): number {
    return this.getSessions().length;
  }

  // Get total message count across all sessions
  getTotalMessageCount(): number {
    return this.getSessions().reduce((total, session) => total + session.messages.length, 0);
  }

  // Ensure at least one session exists
  ensureSessionExists(): ChatSession {
    const sessions = this.getSessions();
    if (sessions.length === 0) {
      return this.createSession();
    }
    return sessions[0];
  }

  // Save sessions to localStorage
  private saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving chat sessions:', error);
      // If storage is full, try to clear old sessions
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.handleStorageFull(sessions);
      }
    }
  }

  // Handle storage full error
  private handleStorageFull(sessions: ChatSession[]): void {
    try {
      // Remove oldest sessions to free up space
      const reducedSessions = sessions.slice(0, Math.floor(this.MAX_SESSIONS / 2));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reducedSessions));
    } catch (error) {
      console.error('Failed to handle storage full error:', error);
    }
  }
}

export const chatStorage = new ChatStorageService(); 