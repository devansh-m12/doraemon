import { RefreshCcw, Copy, Share2, ThumbsUp, ThumbsDown, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MessageTabs from './MessageTabs';
import { Message } from '@/lib/chat-storage';

interface StreamingWord {
  id: number;
  text: string;
}

interface ChatMessagesProps {
  messages: Message[];
  streamingMessageId: string | null;
  streamingWords: StreamingWord[];
  completedMessages: Set<string>;
}

export default function ChatMessages({ 
  messages, 
  streamingMessageId, 
  streamingWords, 
  completedMessages 
}: ChatMessagesProps) {
  const renderMessage = (message: Message) => {
    const isCompleted = completedMessages.has(message.id);
    const isUser = message.type === "user";

    return (
      <div key={message.id} className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
        <div className="flex items-start space-x-3 max-w-[80%]">
          {!isUser && (
            <Avatar className="w-8 h-8">
              <AvatarImage src="/bot-avatar.png" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}
          
          <div
            className={cn(
              "flex-1 px-4 py-2 rounded-2xl",
              isUser 
                ? "bg-white border border-gray-200 rounded-br-none" 
                : "text-gray-900 bg-gray-50 border border-gray-100"
            )}
          >
            {!isUser && message.toolCalls ? (
              <MessageTabs content={message.content} toolCalls={message.toolCalls} />
            ) : (
              <>
                {message.content && (
                  <span className={!isUser && !isCompleted ? "animate-fade-in" : ""}>
                    {message.content}
                  </span>
                )}

                {message.id === streamingMessageId && (
                  <span className="inline">
                    {streamingWords.map((word) => (
                      <span key={word.id} className="animate-fade-in inline">
                        {word.text}
                      </span>
                    ))}
                  </span>
                )}
              </>
            )}
          </div>

          {isUser && (
            <Avatar className="w-8 h-8">
              <AvatarImage src="/user-avatar.png" />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Message actions */}
        {!isUser && message.completed && (
          <div className="flex items-center gap-2 px-4 mt-1 mb-2">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <RefreshCcw className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Copy className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {messages.map((message) => renderMessage(message))}
    </>
  );
} 