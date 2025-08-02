import { chatStorage, ChatSession, Message } from './chat-storage';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('ChatStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('getSessions', () => {
    it('should return empty array when no sessions exist', () => {
      const sessions = chatStorage.getSessions();
      expect(sessions).toEqual([]);
    });

    it('should return sessions from localStorage', () => {
      const mockSessions = [
        {
          id: 'session_1',
          title: 'Test Chat',
          messages: [],
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSessions));
      
      const sessions = chatStorage.getSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('session_1');
    });
  });

  describe('createSession', () => {
    it('should create a new session', () => {
      const session = chatStorage.createSession('Test Session');
      
      expect(session.id).toMatch(/^session_\d+_/);
      expect(session.title).toBe('Test Session');
      expect(session.messages).toEqual([]);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should create session with default title if none provided', () => {
      const session = chatStorage.createSession();
      expect(session.title).toBe('Chat 1');
    });
  });

  describe('addMessage', () => {
    it('should add message to session', () => {
      const session = chatStorage.createSession();
      const message: Message = {
        id: 'msg_1',
        content: 'Hello',
        type: 'user',
        role: 'user',
        timestamp: new Date()
      };
      
      chatStorage.addMessage(session.id, message);
      
      const sessions = chatStorage.getSessions();
      const updatedSession = sessions.find(s => s.id === session.id);
      expect(updatedSession?.messages).toHaveLength(1);
      expect(updatedSession?.messages[0].content).toBe('Hello');
    });
  });

  describe('deleteSession', () => {
    it('should delete session', () => {
      const session = chatStorage.createSession();
      const initialCount = chatStorage.getSessions().length;
      
      chatStorage.deleteSession(session.id);
      
      const finalCount = chatStorage.getSessions().length;
      expect(finalCount).toBe(initialCount - 1);
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      // Should not throw
      expect(() => chatStorage.createSession()).not.toThrow();
    });
  });
}); 