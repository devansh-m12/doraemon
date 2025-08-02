import { RefreshCcw, Copy, Share2, ThumbsUp, ThumbsDown, Bot, User, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import MessageTabs from './MessageTabs';
import DoraemonLoader from './DoraemonLoader';
import { Message } from '@/lib/chat-storage';



interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  completedMessages: Set<string>;
}

export default function ChatMessages({ 
  messages, 
  isLoading = false,
  completedMessages 
}: ChatMessagesProps) {
  const renderMessage = (message: Message) => {
    const isCompleted = completedMessages.has(message.id);
    const isUser = message.type === "user";

    return (
      <div key={message.id} className={cn(
        "flex flex-col animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        isUser ? "items-end" : "items-start"
      )}>
        <div className="flex items-start space-x-3 max-w-[85%] md:max-w-[75%] min-w-[280px] sm:min-w-[320px]">
          {!isUser && (
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src="/bot-avatar.png" />
              <AvatarFallback className="bg-primary text-primary-foreground dark:bg-primary/90 dark:text-primary-foreground">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}
          
          <div
            className={cn(
              "flex-1 px-4 py-3 rounded-2xl transition-all duration-200",
              "shadow-sm border",
              "min-w-[200px] sm:min-w-[240px]",
              isUser 
                ? "bg-primary text-primary-foreground border-primary/20 dark:bg-primary/90 dark:border-primary/30" 
                : "bg-card text-card-foreground border-border/50 dark:bg-card/95 dark:border-border/60"
            )}
          >
            {!isUser && (message.toolCalls || message.mermaidCode) ? (
              <MessageTabs content={message.content} toolCalls={message.toolCalls} mermaidCode={message?.mermaidCode} />
            ) : (
              <div className="space-y-2">
                {message.content && (
                  <div className={cn(
                    "prose prose-sm max-w-none",
                    !isUser && !isCompleted && "animate-fade-in",
                    "dark:prose-invert"
                  )}>
                    <span className="whitespace-pre-wrap">{message.content}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {isUser && (
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src="/user-avatar.png" />
              <AvatarFallback className="bg-secondary text-secondary-foreground dark:bg-secondary/90 dark:text-secondary-foreground">
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
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors dark:text-muted-foreground/80 dark:hover:text-foreground"
              title="Regenerate"
            >
              <RefreshCcw className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors dark:text-muted-foreground/80 dark:hover:text-foreground"
              title="Copy message"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors dark:text-muted-foreground/80 dark:hover:text-foreground"
              title="Share message"
            >
              <Share2 className="w-3 h-3" />
            </Button>
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-green-600 transition-colors dark:text-muted-foreground/80 dark:hover:text-green-400"
                title="Thumbs up"
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600 transition-colors dark:text-muted-foreground/80 dark:hover:text-red-400"
                title="Thumbs down"
              >
                <ThumbsDown className="w-3 h-3" />
              </Button>
            </div>
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground dark:text-muted-foreground/80">
            <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50 dark:text-muted-foreground/30" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm">Ask me anything about DeFi, wallets, tokens, and more!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map(renderMessage)}
          {isLoading && (
            <div className="flex flex-col animate-in fade-in-0 slide-in-from-bottom-2 duration-300 items-start">
              <div className="flex items-start space-x-3 max-w-[85%] md:max-w-[75%] min-w-[280px] sm:min-w-[320px]">
                <div className="flex-1 px-4 py-3 rounded-2xl transition-all duration-200 shadow-sm border bg-card text-card-foreground border-border/50 dark:bg-card/95 dark:border-border/60 min-w-[200px] sm:min-w-[240px]">
                  <DoraemonLoader />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 