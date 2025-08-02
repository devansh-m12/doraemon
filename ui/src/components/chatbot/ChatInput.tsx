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
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div
          ref={inputContainerRef}
          className={cn(
            "relative w-full rounded-3xl border border-gray-200 bg-white p-3 cursor-text",
            isStreaming && "opacity-80",
            !isConnected && "opacity-50"
          )}
          onClick={handleInputContainerClick}
        >
          <div className="pb-9">
            <Textarea
              ref={textareaRef}
              placeholder={
                !isConnected 
                  ? "Connecting..." 
                  : isStreaming 
                  ? "Waiting for response..." 
                  : "Ask me anything about DeFi, wallets, tokens..."
              }
              className="min-h-[24px] max-h-[160px] w-full rounded-3xl border-0 bg-transparent text-gray-900 placeholder:text-gray-400 placeholder:text-base focus-visible:ring-0 focus-visible:ring-offset-0 text-base pl-2 pr-4 pt-0 pb-0 resize-none overflow-y-auto leading-tight"
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

          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "rounded-full h-8 w-8 flex-shrink-0 border-gray-200 p-0 transition-colors",
                    activeButton === "add" && "bg-gray-100 border-gray-300",
                  )}
                  onClick={() => toggleButton("add")}
                  disabled={isStreaming || !isConnected}
                >
                  <Plus className={cn("h-4 w-4 text-gray-500", activeButton === "add" && "text-gray-700")} />
                  <span className="sr-only">Add</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "rounded-full h-8 px-3 flex items-center border-gray-200 gap-1.5 transition-colors",
                    activeButton === "deepSearch" && "bg-gray-100 border-gray-300",
                  )}
                  onClick={() => toggleButton("deepSearch")}
                  disabled={isStreaming || !isConnected}
                >
                  <Search className={cn("h-4 w-4 text-gray-500", activeButton === "deepSearch" && "text-gray-700")} />
                  <span className={cn("text-gray-900 text-sm", activeButton === "deepSearch" && "font-medium")}>
                    DeepSearch
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "rounded-full h-8 px-3 flex items-center border-gray-200 gap-1.5 transition-colors",
                    activeButton === "think" && "bg-gray-100 border-gray-300",
                  )}
                  onClick={() => toggleButton("think")}
                  disabled={isStreaming || !isConnected}
                >
                  <Lightbulb className={cn("h-4 w-4 text-gray-500", activeButton === "think" && "text-gray-700")} />
                  <span className={cn("text-gray-900 text-sm", activeButton === "think" && "font-medium")}>
                    Think
                  </span>
                </Button>
              </div>

              <Button
                type="submit"
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full h-8 w-8 border-0 flex-shrink-0 transition-all duration-200",
                  hasTyped ? "bg-black scale-110" : "bg-gray-200",
                )}
                disabled={!inputValue.trim() || isStreaming || !isConnected}
              >
                <ArrowUp className={cn("h-4 w-4 transition-colors", hasTyped ? "text-white" : "text-gray-500")} />
                <span className="sr-only">Submit</span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 