import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Menu, PenSquare, Zap } from "lucide-react";

interface ChatHeaderProps {
  isConnected: boolean;
  onClearConversation: () => void;
}

export default function ChatHeader({ isConnected, onClearConversation }: ChatHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 flex items-center px-4 z-20 bg-gray-50">
      <div className="w-full flex items-center justify-between px-2">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <Menu className="h-5 w-5 text-gray-700" />
          <span className="sr-only">Menu</span>
        </Button>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-base font-medium text-gray-800">Doraemon</h1>
          <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
            {isConnected ? 'Live' : 'Offline'}
          </Badge>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-8 w-8"
          onClick={onClearConversation}
        >
          <PenSquare className="h-5 w-5 text-gray-700" />
          <span className="sr-only">New Chat</span>
        </Button>
      </div>
    </header>
  );
} 