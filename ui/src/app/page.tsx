'use client';

import { ChatInterface, ErrorBoundary } from '@/components/chatbot';
import ChatLayout from '@/components/chatbot/ChatLayout';

export default function Home() {
  return (
    <ChatLayout>
      <ErrorBoundary>
        <ChatInterface />
      </ErrorBoundary>
    </ChatLayout>
  );
}