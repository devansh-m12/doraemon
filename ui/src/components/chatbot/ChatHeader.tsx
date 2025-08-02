import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Menu, PenSquare, Zap, Plus } from "lucide-react";

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
    <header className="fixed top-0 left-0 right-0 h-12 flex items-center px-4 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full flex items-center justify-between px-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-8 w-8 hover:bg-gray-100"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5 text-gray-700" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-base font-medium text-gray-800 hidden sm:block">Doraemon</h1>
          <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
            {isConnected ? 'Live' : 'Offline'}
          </Badge>
        </div>

        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-8 w-8 hover:bg-gray-100"
            onClick={onNewSession}
          >
            <Plus className="h-5 w-5 text-gray-700" />
            <span className="sr-only">New Chat</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-8 w-8 hover:bg-gray-100"
            onClick={onClearConversation}
          >
            <PenSquare className="h-5 w-5 text-gray-700" />
            <span className="sr-only">Clear Chat</span>
          </Button>
        </div>
      </div>
    </header>
  );
} 