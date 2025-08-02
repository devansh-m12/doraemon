'use client';

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { mcpClient } from '../../lib/mcp-client';
import { chatStorage, ChatSession, Message } from '../../lib/chat-storage';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import SessionSidebar from './SessionSidebar';
import ChatContainer from './ChatContainer';
import { cn } from '@/lib/utils';

type ActiveButton = "none" | "add" | "deepSearch" | "think";
type MessageType = "user" | "system";

interface MessageSection {
  id: string;
  messages: Message[];
  isNewSection: boolean;
  isActive?: boolean;
  sectionIndex: number;
}



interface ChatState {
  messages: Message[];
  isLoading: boolean;
  conversationId: string;
  isConnected: boolean;
}



export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const newSectionRef = useRef<HTMLDivElement>(null);
  const [hasTyped, setHasTyped] = useState(false);
  const [activeButton, setActiveButton] = useState<ActiveButton>("none");
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageSections, setMessageSections] = useState<MessageSection[]>([]);
  const [viewportHeight, setViewportHeight] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(new Set());
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const selectionStateRef = useRef<{ start: number | null; end: number | null }>({ start: null, end: null });

  // Session management state
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

  // Chat state
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    conversationId: `conv_${Date.now()}`,
    isConnected: false
  });

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Load session messages when current session changes
  useEffect(() => {
    if (currentSession) {
      setMessages(currentSession.messages);
      setChatState(prev => ({
        ...prev,
        conversationId: currentSession.id
      }));
    }
  }, [currentSession]);

  // Check mobile and viewport on mount and resize
  useEffect(() => {
    const checkMobileAndViewport = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setViewportHeight(window.innerHeight);
    };

    checkMobileAndViewport();
    window.addEventListener('resize', checkMobileAndViewport);
    return () => window.removeEventListener('resize', checkMobileAndViewport);
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);



  // Update message sections when messages change
  useEffect(() => {
    const sections: MessageSection[] = [];
    let currentSection: Message[] = [];
    let sectionIndex = 0;

    messages.forEach((message, index) => {
      currentSection.push(message);
      
      // Create new section if next message is from different type or if it's the last message
      const nextMessage = messages[index + 1];
      const shouldCreateNewSection = !nextMessage || nextMessage.type !== message.type;
      
      if (shouldCreateNewSection && currentSection.length > 0) {
        sections.push({
          id: `section-${sectionIndex}`,
          messages: [...currentSection],
          isNewSection: index === 0,
          sectionIndex
        });
        currentSection = [];
        sectionIndex++;
      }
    });

    setMessageSections(sections);
  }, [messages]);

  const checkConnection = async () => {
    try {
      const health = await fetch('http://localhost:3939/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }); 
      const data = await health.json();
      setChatState(prev => ({ ...prev, isConnected: data.status === 'healthy' }));
    } catch (error) {
      console.error('Connection check failed:', error);
      setChatState(prev => ({ ...prev, isConnected: false }));
    }
  };

  const initializeSession = () => {
    const sessions = chatStorage.getSessions();
    if (sessions.length === 0) {
      const newSession = chatStorage.createSession();
      setCurrentSession(newSession);
    } else {
      setCurrentSession(sessions[0]);
    }
  };

  const handleNewSession = () => {
    const newSession = chatStorage.createSession();
    setCurrentSession(newSession);
    setMessages([]);
    setMessageSections([]);
    setCompletedMessages(new Set());
    setActiveSectionId(null);
    setSidebarRefreshTrigger(prev => prev + 1);
  };

  const handleSessionSelect = (session: ChatSession) => {
    setCurrentSession(session);
    setIsSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClearConversation = () => {
    if (currentSession) {
      chatStorage.updateSession(currentSession.id, { messages: [] });
      setMessages([]);
      setMessageSections([]);
      setCompletedMessages(new Set());
      setActiveSectionId(null);
    }
  };

  const getContentHeight = () => {
    return viewportHeight - 200; // Adjusted for better responsive design
  };

  const saveSelectionState = () => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      selectionStateRef.current = { start: selectionStart, end: selectionEnd };
    }
  };

  const restoreSelectionState = () => {
    if (textareaRef.current && selectionStateRef.current.start !== null) {
      textareaRef.current.setSelectionRange(
        selectionStateRef.current.start,
        selectionStateRef.current.end
      );
    }
  };

  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleInputContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      focusTextarea();
    }
  };



  const sendMessage = async () => {
    if (!inputValue.trim() || chatState.isLoading || !chatState.isConnected) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      completed: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setHasTyped(false);
    setChatState(prev => ({ ...prev, isLoading: true }));

    try {
      const response:any = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue.trim(),
          conversationId: chatState.conversationId
        })
      });
      const data = await response.json();

      // Parse the MCP response to extract the actual message content
      let responseContent = data?.data?.content;
      let functionCalls = data?.data?.functionCalls;
      let mermaidCode = data?.data?.mermaidCode;

      const aiMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        type: 'system',
        content: responseContent || '',
        timestamp: new Date(),
        completed: true,
        toolCalls: functionCalls || [],
        mermaidCode: mermaidCode
      };

      setMessages(prev => [...prev, aiMessage]);
      setCompletedMessages(prev => new Set([...prev, aiMessage.id]));

      if (currentSession) {
        chatStorage.addMessage(currentSession.id, userMessage);
        chatStorage.addMessage(currentSession.id, {
          ...aiMessage,
          content: responseContent || '',
          completed: true,
          toolCalls: functionCalls,
          mermaidCode: mermaidCode
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        completed: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatState(prev => ({ ...prev, isLoading: false }));
      setTimeout(() => {
        focusTextarea();
      }, 100);
    }
  };

  const simulateAIResponse = async (userMessage: string) => {
    // Simulate AI response for testing
    const responses = [
      "I understand you're asking about DeFi. Let me help you with that!",
      "That's an interesting question about blockchain technology. Here's what I can tell you...",
      "I can help you with wallet management, token prices, and more. What specific information do you need?",
      "Great question! Let me provide you with some insights about the DeFi ecosystem."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const aiMessage: Message = {
      id: `msg_${Date.now()}_ai`,
      type: 'system',
      content: randomResponse,
      timestamp: new Date(),
      completed: true
    };

    setMessages(prev => [...prev, aiMessage]);
    setCompletedMessages(prev => new Set([...prev, aiMessage.id]));
    
    if (currentSession) {
      chatStorage.addMessage(currentSession.id, aiMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setHasTyped(value.length > 0);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleButton = (button: ActiveButton) => {
    setActiveButton(activeButton === button ? "none" : button);
  };

  const clearConversation = () => {
    handleClearConversation();
  };

  const shouldApplyHeight = (sectionIndex: number) => {
    return sectionIndex === messageSections.length - 1;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <SessionSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentSessionId={currentSession?.id || ''}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        refreshTrigger={sidebarRefreshTrigger}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col w-full">
        {/* Header */}
        <ChatHeader
          isConnected={chatState.isConnected}
          onClearConversation={clearConversation}
          onToggleSidebar={handleToggleSidebar}
          onNewSession={handleNewSession}
        />

        {/* Main Content Area */}
        {messages.length === 0 ? (
          /* Centered Input when no messages */
          <div className="flex-1 flex items-center justify-center mx-auto">
            <ChatInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              hasTyped={hasTyped}
              setHasTyped={setHasTyped}
              activeButton={activeButton}
              setActiveButton={setActiveButton}
              isStreaming={chatState.isLoading}
              isConnected={chatState.isConnected}
              isMobile={isMobile}
              textareaRef={textareaRef}
              inputContainerRef={inputContainerRef}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              handleKeyDown={handleKeyDown}
              handleInputContainerClick={handleInputContainerClick}
              toggleButton={toggleButton}
              focusTextarea={focusTextarea}
            />
          </div>
        ) : (
          /* Messages and Input at bottom when messages exist */
          <>
            {/* Messages Area */}
            <div 
              ref={mainContainerRef}
              className="w-3/4 mx-auto overflow-y-auto relative no-scrollbar"
              style={{ height: getContentHeight() }}
            >
              <div className="h-full flex flex-col">
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar"
                >
                  <ChatMessages
                    messages={messages}
                    isLoading={chatState.isLoading}
                    completedMessages={completedMessages}
                  />
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border/60 dark:bg-background/98 dark:backdrop-blur-md">
              <div className="p-4">
                <ChatInput
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  hasTyped={hasTyped}
                  setHasTyped={setHasTyped}
                  activeButton={activeButton}
                  setActiveButton={setActiveButton}
                  isStreaming={chatState.isLoading}
                  isConnected={chatState.isConnected}
                  isMobile={isMobile}
                  textareaRef={textareaRef}
                  inputContainerRef={inputContainerRef}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  handleKeyDown={handleKeyDown}
                  handleInputContainerClick={handleInputContainerClick}
                  toggleButton={toggleButton}
                  focusTextarea={focusTextarea}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 