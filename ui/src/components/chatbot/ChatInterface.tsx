'use client';

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { mcpClient } from '../../lib/mcp-client';
import { chatStorage, ChatSession, Message } from '../../lib/chat-storage';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import WelcomeCard from './WelcomeCard';
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

interface StreamingWord {
  id: number;
  text: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  conversationId: string;
  isConnected: boolean;
}

// Faster word delay for smoother streaming
const WORD_DELAY = 40; // ms per word
const CHUNK_SIZE = 2; // Number of words to add at once

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
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingWords, setStreamingWords] = useState<StreamingWord[]>([]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(new Set());
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const shouldFocusAfterStreamingRef = useRef(false);
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

  // Handle streaming completion
  useEffect(() => {
    if (!isStreaming && shouldFocusAfterStreamingRef.current) {
      shouldFocusAfterStreamingRef.current = false;
      setTimeout(() => {
        focusTextarea();
      }, 100);
    }
  }, [isStreaming]);

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
      const health = await mcpClient.healthCheck();
      setChatState(prev => ({ ...prev, isConnected: health.status === 'healthy' }));
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
    setStreamingWords([]);
    setStreamingMessageId(null);
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
      setStreamingWords([]);
      setStreamingMessageId(null);
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

  const simulateTextStreaming = async (text: string) => {
    const words = text.split(' ');
    const streamingWords: StreamingWord[] = [];
    
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      const chunk = words.slice(i, i + CHUNK_SIZE);
      chunk.forEach((word, index) => {
        streamingWords.push({
          id: i + index,
          text: word + (i + index < words.length - 1 ? ' ' : '')
        });
      });
      
      setStreamingWords([...streamingWords]);
      await new Promise(resolve => setTimeout(resolve, WORD_DELAY));
    }
    
    return streamingWords.map(w => w.text).join('');
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isStreaming || !chatState.isConnected) return;

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
    setIsStreaming(true);

    try {
      const response = await mcpClient.callTool({
        name: 'intelligent_chat',
        arguments: {
          conversationId: chatState.conversationId,
          message: inputValue.trim()
        }
      });
      
      const aiMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        type: 'system',
        content: '',
        timestamp: new Date(),
        completed: false,
        toolCalls: response.result?.data?.functionCalls || []
      };

      setMessages(prev => [...prev, aiMessage]);
      setStreamingMessageId(aiMessage.id);
      setStreamingWords([]);

      // Parse the MCP response to extract the actual message content
      let responseContent = '';
      let functionCalls = [];
      console.log(response);
      
      // Check if response has content array structure
      if (response.content && Array.isArray(response.content) && response.content.length > 0) {
        const firstContent = response.content[0];
        if (firstContent.type === 'text' && firstContent.text) {
          try {
            // Parse the text content as JSON
            const parsedText = JSON.parse(firstContent.text);
            
            // Extract the actual response data
            if (parsedText.data?.response) {
              responseContent = parsedText.data.response;
              functionCalls = parsedText.data.functionCalls || [];
            } else if (typeof parsedText === 'string') {
              responseContent = parsedText;
            } else {
              responseContent = firstContent.text;
            }
          } catch (error) {
            console.error('Error parsing response text as JSON:', error);
            responseContent = firstContent.text;
          }
        }
      } else if (response.result?.data?.response) {
        // Fallback to the old structure
        try {
          // The response might be a JSON string that needs to be parsed
          const responseData = response.result.data.response;
          let parsedResponse;
          
          // Try to parse as JSON first
          try {
            parsedResponse = JSON.parse(responseData);
          } catch {
            // If it's not JSON, use the response as-is
            parsedResponse = { data: { response: responseData } };
          }
          
          // Extract the actual response content
          if (parsedResponse.data?.response) {
            responseContent = parsedResponse.data.response;
            functionCalls = parsedResponse.data.functionCalls || [];
          } else if (typeof parsedResponse === 'string') {
            responseContent = parsedResponse;
          } else {
            responseContent = responseData;
          }
        } catch (error) {
          console.error('Error parsing MCP response:', error);
          responseContent = response.result.data.response;
        }
      }
      
      if (responseContent) {
        const streamedContent = await simulateTextStreaming(responseContent);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, content: streamedContent, completed: true, toolCalls: functionCalls }
              : msg
          )
        );
        setCompletedMessages(prev => new Set([...prev, aiMessage.id]));
      }

      if (currentSession) {
        chatStorage.addMessage(currentSession.id, userMessage);
        chatStorage.addMessage(currentSession.id, {
          ...aiMessage,
          content: responseContent || '',
          completed: true,
          toolCalls: functionCalls
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
      setIsStreaming(false);
      setStreamingMessageId(null);
      setStreamingWords([]);
      shouldFocusAfterStreamingRef.current = true;
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
      content: '',
      timestamp: new Date(),
      completed: false
    };

    setMessages(prev => [...prev, aiMessage]);
    setStreamingMessageId(aiMessage.id);
    setStreamingWords([]);

    // Simulate streaming
    const streamedContent = await simulateTextStreaming(randomResponse);
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === aiMessage.id 
          ? { ...msg, content: streamedContent, completed: true }
          : msg
      )
    );
    
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader
          isConnected={chatState.isConnected}
          onClearConversation={clearConversation}
          onToggleSidebar={handleToggleSidebar}
          onNewSession={handleNewSession}
        />

        {/* Messages Area */}
        <div 
          ref={mainContainerRef}
          className="flex-1 overflow-y-auto relative"
          style={{ height: getContentHeight() }}
        >
          <div className="h-full flex flex-col">
            {/* Welcome Card or Messages */}
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-2xl">
                  <WelcomeCard />
                </div>
              </div>
            ) : (
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
              >
                <ChatMessages
                  messages={messages}
                  streamingMessageId={streamingMessageId}
                  streamingWords={streamingWords}
                  completedMessages={completedMessages}
                />
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-4">
            <ChatInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              hasTyped={hasTyped}
              setHasTyped={setHasTyped}
              activeButton={activeButton}
              setActiveButton={setActiveButton}
              isStreaming={isStreaming}
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
      </div>
    </div>
  );
} 