import { Search, Plus, Lightbulb, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RefObject } from "react";

type ActiveButton = "none" | "add" | "deepSearch" | "think";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  hasTyped: boolean;
  setHasTyped: (value: boolean) => void;
  activeButton: ActiveButton;
  setActiveButton: (button: ActiveButton) => void;
  isStreaming: boolean;
  isConnected: boolean;
  isMobile: boolean;
  textareaRef: RefObject<HTMLTextAreaElement>;
  inputContainerRef: RefObject<HTMLDivElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleInputContainerClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  toggleButton: (button: ActiveButton) => void;
  focusTextarea: () => void;
}

export default function ChatInput({
  inputValue,
  setInputValue,
  hasTyped,
  setHasTyped,
  activeButton,
  setActiveButton,
  isStreaming,
  isConnected,
  isMobile,
  textareaRef,
  inputContainerRef,
  handleInputChange,
  handleSubmit,
  handleKeyDown,
  handleInputContainerClick,
  toggleButton,
  focusTextarea
}: ChatInputProps) {
  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="w-full">
        <div
          ref={inputContainerRef}
          className={cn(
            "relative w-full rounded-2xl border border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 cursor-text transition-all duration-200",
            "hover:border-border/70 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
            "dark:bg-background/98 dark:border-border/60 dark:hover:border-border/80 dark:focus-within:border-primary/60 dark:focus-within:ring-primary/30",
            isStreaming && "opacity-80 pointer-events-none",
            !isConnected && "opacity-50",
            "shadow-lg hover:shadow-xl"
          )}
          onClick={handleInputContainerClick}
        >
          <div className="flex flex-col space-y-3">
            {/* Textarea */}
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                placeholder={
                  !isConnected 
                    ? "Connecting..." 
                    : isStreaming 
                    ? "Waiting for response..." 
                    : "Message Doraemon..."
                }
                className={cn(
                  "min-h-[24px] max-h-[160px] w-full border-0 bg-transparent",
                  "text-foreground placeholder:text-muted-foreground/60",
                  "text-base leading-relaxed resize-none overflow-y-auto",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "transition-all duration-200",
                  "dark:text-foreground dark:placeholder:text-muted-foreground/70"
                )}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (textareaRef.current) {
                    textareaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                disabled={!isConnected || isStreaming}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    "dark:hover:bg-accent/80 dark:hover:text-accent-foreground",
                    activeButton === "add" && "bg-primary text-primary-foreground dark:bg-primary/90 dark:text-primary-foreground"
                  )}
                  onClick={() => toggleButton("add")}
                  title="Add context"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    "dark:hover:bg-accent/80 dark:hover:text-accent-foreground",
                    activeButton === "deepSearch" && "bg-primary text-primary-foreground dark:bg-primary/90 dark:text-primary-foreground"
                  )}
                  onClick={() => toggleButton("deepSearch")}
                  title="Deep search"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    "dark:hover:bg-accent/80 dark:hover:text-accent-foreground",
                    activeButton === "think" && "bg-primary text-primary-foreground dark:bg-primary/90 dark:text-primary-foreground"
                  )}
                  onClick={() => toggleButton("think")}
                  title="Think step by step"
                >
                  <Lightbulb className="h-4 w-4" />
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="sm"
                disabled={!isConnected || isStreaming || !inputValue.trim()}
                className={cn(
                  "h-8 px-4 rounded-full transition-all duration-200",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "dark:bg-primary/90 dark:text-primary-foreground dark:hover:bg-primary",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center gap-2"
                )}
              >
                <ArrowUp className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 