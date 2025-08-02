import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SessionSidebar from './SessionSidebar';
import { chatStorage } from '@/lib/chat-storage';

// Mock the chat storage
jest.mock('@/lib/chat-storage', () => ({
  chatStorage: {
    getSessions: jest.fn(),
    createSession: jest.fn(),
    deleteSession: jest.fn(),
    clearAllSessions: jest.fn(),
  },
}));

describe('SessionSidebar', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    currentSessionId: 'session_1',
    onSessionSelect: jest.fn(),
    onNewSession: jest.fn(),
    refreshTrigger: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (chatStorage.getSessions as jest.Mock).mockReturnValue([
      {
        id: 'session_1',
        title: 'Test Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  });

  it('should refresh sessions when refreshTrigger changes', async () => {
    const { rerender } = render(<SessionSidebar {...mockProps} />);
    
    // Initial load
    expect(chatStorage.getSessions).toHaveBeenCalledTimes(1);
    
    // Update refreshTrigger
    rerender(<SessionSidebar {...mockProps} refreshTrigger={1} />);
    
    await waitFor(() => {
      expect(chatStorage.getSessions).toHaveBeenCalledTimes(2);
    });
  });

  it('should refresh sessions when sidebar opens', async () => {
    const { rerender } = render(<SessionSidebar {...mockProps} isOpen={false} />);
    
    // Update to open sidebar
    rerender(<SessionSidebar {...mockProps} isOpen={true} />);
    
    await waitFor(() => {
      expect(chatStorage.getSessions).toHaveBeenCalledTimes(2);
    });
  });

  it('should show session count in header', () => {
    render(<SessionSidebar {...mockProps} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should handle new session creation', () => {
    render(<SessionSidebar {...mockProps} />);
    
    const newSessionButton = screen.getByTitle('New Chat');
    fireEvent.click(newSessionButton);
    
    expect(mockProps.onNewSession).toHaveBeenCalled();
  });
}); 