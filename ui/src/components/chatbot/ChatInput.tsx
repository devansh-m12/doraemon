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
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="w-full">
        <div
          ref={inputContainerRef}
          className={cn(
            "relative w-full rounded-2xl border border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 cursor-text transition-all duration-200",
            "hover:border-border/70 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
            isStreaming && "opacity-80 pointer-events-none",
            !isConnected && "opacity-50"
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
                    : "Ask me anything about DeFi, wallets, tokens..."
                }
                className={cn(
                  "min-h-[24px] max-h-[160px] w-full border-0 bg-transparent",
                  "text-foreground placeholder:text-muted-foreground/60",
                  "text-base leading-relaxed resize-none overflow-y-auto",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "transition-all duration-200"
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
                    "border border-border/50 hover:border-border/70",
                    activeButton === "add" && "bg-accent text-accent-foreground border-accent"
                  )}
                  onClick={() => toggleButton("add")}
                  disabled={isStreaming || !isConnected}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    "border border-border/50 hover:border-border/70",
                    activeButton === "deepSearch" && "bg-accent text-accent-foreground border-accent"
                  )}
                  onClick={() => toggleButton("deepSearch")}
                  disabled={isStreaming || !isConnected}
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Deep Search</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    "border border-border/50 hover:border-border/70",
                    activeButton === "think" && "bg-accent text-accent-foreground border-accent"
                  )}
                  onClick={() => toggleButton("think")}
                  disabled={isStreaming || !isConnected}
                >
                  <Lightbulb className="h-4 w-4" />
                  <span className="sr-only">Think</span>
                </Button>
              </div>

              {/* Send Button */}
              <Button
                type="submit"
                size="sm"
                className={cn(
                  "h-8 w-8 rounded-full transition-all duration-200",
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  hasTyped && !isStreaming && "animate-pulse"
                )}
                disabled={!hasTyped || isStreaming || !isConnected}
              >
                <ArrowUp className="h-4 w-4" />
                <span className="sr-only">Send Message</span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 