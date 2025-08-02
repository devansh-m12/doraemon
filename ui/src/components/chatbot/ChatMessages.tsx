import { RefreshCcw, Copy, Share2, ThumbsUp, ThumbsDown, Bot, User, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
    const isStreaming = message.id === streamingMessageId;

    return (
      <div key={message.id} className={cn(
        "flex flex-col animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        isUser ? "items-end" : "items-start"
      )}>
        <div className="flex items-start space-x-3 max-w-[85%] md:max-w-[75%]">
          {!isUser && (
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src="/bot-avatar.png" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}
          
          <div
            className={cn(
              "flex-1 px-4 py-3 rounded-2xl transition-all duration-200",
              "shadow-sm border",
              isUser 
                ? "bg-primary text-primary-foreground border-primary/20" 
                : "bg-card text-card-foreground border-border/50"
            )}
          >
            {!isUser && message.toolCalls ? (
              <MessageTabs content={message.content} toolCalls={message.toolCalls} />
            ) : (
              <div className="space-y-2">
                {message.content && (
                  <div className={cn(
                    "prose prose-sm max-w-none",
                    !isUser && !isCompleted && "animate-fade-in"
                  )}>
                    <span className="whitespace-pre-wrap">{message.content}</span>
                  </div>
                )}

                {isStreaming && (
                  <div className="inline-flex items-center space-x-1">
                    {streamingWords.map((word) => (
                      <span key={word.id} className="animate-fade-in inline">
                        {word.text}
                      </span>
                    ))}
                    <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1"></span>
                  </div>
                )}
              </div>
            )}
          </div>

          {isUser && (
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src="/user-avatar.png" />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Message actions */}
        {!isUser && message.completed && (
          <div className="flex items-center gap-1 px-4 mt-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors"
              title="Regenerate"
            >
              <RefreshCcw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors"
              title="Copy"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors"
              title="Share"
            >
              <Share2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors"
              title="Like"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors"
              title="Dislike"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Completion indicator */}
        {!isUser && isCompleted && (
          <div className="flex items-center gap-1 px-4 mt-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 group">
      {messages.map(renderMessage)}
    </div>
  );
} 