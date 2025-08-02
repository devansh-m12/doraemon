import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, PenSquare, Zap, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  isConnected: boolean;
  onClearConversation: () => void;
  onToggleSidebar: () => void;
  onNewSession: () => void;
}

export default function ChatHeader({ 
  isConnected, 
  onClearConversation, 
  onToggleSidebar,
  onNewSession 
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6 lg:px-8">
        {/* Sidebar Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          onClick={onToggleSidebar}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        {/* Brand & Status */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-sm">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground hidden sm:block">Doraemon</h1>
              <Badge 
                variant={isConnected ? 'default' : 'destructive'} 
                className={cn(
                  "text-xs font-medium px-2 py-0.5 transition-all duration-200",
                  isConnected ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                )}
              >
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            onClick={onNewSession}
            title="New Chat"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Chat</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            onClick={onClearConversation}
            title="Clear Chat"
          >
            <PenSquare className="h-4 w-4" />
            <span className="sr-only">Clear Chat</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
} 