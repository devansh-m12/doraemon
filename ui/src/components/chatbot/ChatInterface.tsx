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

  // Constants for layout calculations
  const HEADER_HEIGHT = 48;
  const INPUT_AREA_HEIGHT = 100;
  const TOP_PADDING = 48;
  const BOTTOM_PADDING = 128;
  const ADDITIONAL_OFFSET = 16;

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

  // Check if device is mobile and get viewport height
  useEffect(() => {
    const checkMobileAndViewport = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);

      const vh = window.innerHeight;
      setViewportHeight(vh);

      if (isMobileDevice && mainContainerRef.current) {
        mainContainerRef.current.style.height = `${vh}px`;
      }
    };

    checkMobileAndViewport();

    if (mainContainerRef.current) {
      mainContainerRef.current.style.height = isMobile ? `${viewportHeight}px` : "100svh";
    }

    window.addEventListener("resize", checkMobileAndViewport);

    return () => {
      window.removeEventListener("resize", checkMobileAndViewport);
    };
  }, [isMobile, viewportHeight]);

  // Organize messages into sections
  useEffect(() => {
    if (messages.length === 0) {
      setMessageSections([]);
      setActiveSectionId(null);
      return;
    }

    const sections: MessageSection[] = [];
    let currentSection: MessageSection = {
      id: `section-${Date.now()}-0`,
      messages: [],
      isNewSection: false,
      sectionIndex: 0,
    };

    messages.forEach((message) => {
      if (message.newSection) {
        if (currentSection.messages.length > 0) {
          sections.push({
            ...currentSection,
            isActive: false,
          });
        }

        const newSectionId = `section-${Date.now()}-${sections.length}`;
        currentSection = {
          id: newSectionId,
          messages: [message],
          isNewSection: true,
          isActive: true,
          sectionIndex: sections.length,
        };

        setActiveSectionId(newSectionId);
      } else {
        currentSection.messages.push(message);
      }
    });

    if (currentSection.messages.length > 0) {
      sections.push(currentSection);
    }

    setMessageSections(sections);
  }, [messages]);

  // Scroll to maximum position when new section is created
  useEffect(() => {
    if (messageSections.length > 1) {
      setTimeout(() => {
        const scrollContainer = chatContainerRef.current;
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [messageSections]);

  // Focus the textarea on component mount (only on desktop)
  useEffect(() => {
    if (textareaRef.current && !isMobile) {
      textareaRef.current.focus();
    }
  }, [isMobile]);

  // Set focus back to textarea after streaming ends (only on desktop)
  useEffect(() => {
    if (!isStreaming && shouldFocusAfterStreamingRef.current && !isMobile) {
      focusTextarea();
      shouldFocusAfterStreamingRef.current = false;
    }
  }, [isStreaming, isMobile]);

  const checkConnection = async () => {
    try {
      const health = await mcpClient.healthCheck();
      setChatState(prev => ({ ...prev, isConnected: health.status === 'healthy' }));
    } catch (error) {
      console.error('Connection check failed:', error);
      setChatState(prev => ({ ...prev, isConnected: false }));
    }
  };

  // Session management functions
  const initializeSession = () => {
    const session = chatStorage.ensureSessionExists();
    setCurrentSession(session);
  };

  const handleNewSession = () => {
    const newSession = chatStorage.createSession();
    setCurrentSession(newSession);
    setMessages([]);
    setMessageSections([]);
    setCompletedMessages(new Set());
    setActiveSectionId(null);
    setIsSidebarOpen(false);
    setSidebarRefreshTrigger(prev => prev + 1); // Trigger sidebar refresh
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

  // Calculate available content height
  const getContentHeight = () => {
    return viewportHeight - TOP_PADDING - BOTTOM_PADDING - ADDITIONAL_OFFSET;
  };

  // Save the current selection state
  const saveSelectionState = () => {
    if (textareaRef.current) {
      selectionStateRef.current = {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      };
    }
  };

  // Restore the saved selection state
  const restoreSelectionState = () => {
    const textarea = textareaRef.current;
    const { start, end } = selectionStateRef.current;

    if (textarea && start !== null && end !== null) {
      textarea.focus();
      textarea.setSelectionRange(start, end);
    } else if (textarea) {
      textarea.focus();
    }
  };

  const focusTextarea = () => {
    if (textareaRef.current && !isMobile) {
      textareaRef.current.focus();
    }
  };

  const handleInputContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      e.target === e.currentTarget ||
      (e.currentTarget === inputContainerRef.current && !(e.target as HTMLElement).closest("button"))
    ) {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const simulateTextStreaming = async (text: string) => {
    const words = text.split(" ");
    let currentIndex = 0;
    setStreamingWords([]);
    setIsStreaming(true);

    return new Promise<void>((resolve) => {
      const streamInterval = setInterval(() => {
        if (currentIndex < words.length) {
          const nextIndex = Math.min(currentIndex + CHUNK_SIZE, words.length);
          const newWords = words.slice(currentIndex, nextIndex);

          setStreamingWords((prev) => [
            ...prev,
            {
              id: Date.now() + currentIndex,
              text: newWords.join(" ") + " ",
            },
          ]);

          currentIndex = nextIndex;
        } else {
          clearInterval(streamInterval);
          resolve();
        }
      }, WORD_DELAY);
    });
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isStreaming || !chatState.isConnected || !currentSession) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      type: "user",
      newSection: messages.length > 0,
      role: 'user',
      timestamp: new Date()
    };

    // Add vibration when message is submitted
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Reset input before starting the AI response
    setInputValue("");
    setHasTyped(false);
    setActiveButton("none");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Add the message to state and storage
    setMessages((prev) => [...prev, userMessage]);
    chatStorage.addMessage(currentSession.id, userMessage);

    // Only focus the textarea on desktop, not on mobile
    if (!isMobile) {
      focusTextarea();
    } else {
      if (textareaRef.current) {
        textareaRef.current.blur();
      }
    }

    // Start AI response
    await simulateAIResponse(userMessage.content);
  };

  const simulateAIResponse = async (userMessage: string) => {
    const messageId = Date.now().toString();
    setStreamingMessageId(messageId);

    const aiMessage: Message = {
      id: messageId,
      content: "",
      type: "system",
      role: 'assistant',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, aiMessage]);
    if (currentSession) {
      chatStorage.addMessage(currentSession.id, aiMessage);
    }

    // Add a delay before the second vibration
    setTimeout(() => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 200);

    try {
      const response: any = await mcpClient.callTool({
        name: 'intelligent_chat',
        arguments: {
          conversationId: chatState.conversationId,
          message: userMessage
        }
      });

      // Handle different response structures
      let aiResponse = 'No response received';
      let toolCalls = null;

      // Check for new MCP response structure with content array
      if (response?.content && Array.isArray(response.content)) {
        const textContent = response.content.find(item => item.type === 'text');
        if (textContent?.text) {
          try {
            const parsedContent = JSON.parse(textContent.text);
            if (parsedContent.success && parsedContent.data?.response) {
              aiResponse = parsedContent.data.response;
              toolCalls = parsedContent.data.functionCalls;
            }
          } catch (e) {
            // If parsing fails, use the text directly
            aiResponse = textContent.text;
          }
        }
      } else if (response?.result?.data?.response) {
        aiResponse = response.result.data.response;
        toolCalls = response.result.data.functionCalls;
      } else if (response?.data?.response) {
        aiResponse = response.data.response;
        toolCalls = response.data.functionCalls;
      } else if (typeof response === 'string') {
        aiResponse = response;
      }

      // Stream the text
      await simulateTextStreaming(aiResponse);

      // Update with complete message
      const updatedMessage = {
        content: aiResponse,
        completed: true,
        toolCalls: toolCalls
      };

      setMessages((prev) =>
        prev.map((msg) => 
          msg.id === messageId 
            ? { ...msg, ...updatedMessage } 
            : msg
        ),
      );

      if (currentSession) {
        chatStorage.updateMessage(currentSession.id, messageId, updatedMessage);
      }

      // Add to completed messages set
      setCompletedMessages((prev) => new Set(prev).add(messageId));

      // Add vibration when streaming ends
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorResponse = 'Sorry, I encountered an error. Please try again.';
      await simulateTextStreaming(errorResponse);

      const errorMessageUpdate = {
        content: errorResponse,
        completed: true
      };

      setMessages((prev) =>
        prev.map((msg) => 
          msg.id === messageId 
            ? { ...msg, ...errorMessageUpdate } 
            : msg
        ),
      );

      if (currentSession) {
        chatStorage.updateMessage(currentSession.id, messageId, errorMessageUpdate);
      }

      setCompletedMessages((prev) => new Set(prev).add(messageId));
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }

    // Reset streaming state
    setStreamingWords([]);
    setStreamingMessageId(null);
    setIsStreaming(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (!isStreaming) {
      setInputValue(newValue);

      if (newValue.trim() !== "" && !hasTyped) {
        setHasTyped(true);
      } else if (newValue.trim() === "" && hasTyped) {
        setHasTyped(false);
      }

      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        const newHeight = Math.max(24, Math.min(textarea.scrollHeight, 160));
        textarea.style.height = `${newHeight}px`;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isStreaming && e.key === "Enter" && e.metaKey) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }

    if (!isStreaming && !isMobile && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleButton = (button: ActiveButton) => {
    if (!isStreaming) {
      saveSelectionState();
      setActiveButton((prev) => (prev === button ? "none" : button));
      setTimeout(() => {
        restoreSelectionState();
      }, 0);
    }
  };

  const clearConversation = () => {
    handleClearConversation();
  };

  const shouldApplyHeight = (sectionIndex: number) => {
    return sectionIndex > 0;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SessionSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentSessionId={currentSession?.id || ''}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        refreshTrigger={sidebarRefreshTrigger}
      />

      {/* Main Chat Interface */}
      <div
        ref={mainContainerRef}
        className="flex-1 flex flex-col overflow-hidden relative"
        style={{ height: isMobile ? `${viewportHeight}px` : "100svh" }}
      >
        <ChatHeader 
          isConnected={chatState.isConnected}
          onClearConversation={clearConversation}
          onToggleSidebar={handleToggleSidebar}
          onNewSession={handleNewSession}
        />

        <div 
          ref={chatContainerRef} 
          className="flex-grow overflow-y-auto px-4"
          style={{ 
            paddingTop: '60px', // Account for fixed header
            paddingBottom: '120px' // Account for input area
          }}
        >
          <div className="max-w-3xl mx-auto space-y-4">
            {messageSections.length === 0 && (
              <WelcomeCard />
            )}

            {messageSections.map((section, sectionIndex) => (
              <div
                key={section.id}
                ref={sectionIndex === messageSections.length - 1 && section.isNewSection ? newSectionRef : null}
              >
                {section.isNewSection && (
                  <div
                    style={
                      section.isActive && shouldApplyHeight(section.sectionIndex)
                        ? { height: `${getContentHeight()}px` }
                        : {}
                    }
                    className="pt-4 flex flex-col justify-start"
                  >
                    <ChatMessages 
                      messages={section.messages}
                      streamingMessageId={streamingMessageId}
                      streamingWords={streamingWords}
                      completedMessages={completedMessages}
                    />
                  </div>
                )}

                {!section.isNewSection && (
                  <ChatMessages 
                    messages={section.messages}
                    streamingMessageId={streamingMessageId}
                    streamingWords={streamingWords}
                    completedMessages={completedMessages}
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

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
  );
} 