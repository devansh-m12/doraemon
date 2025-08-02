import { MessageCircle } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';

export default function WelcomeCard() {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Welcome to Doraemon!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your AI assistant for all things DeFi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Check wallet balances</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Get token prices</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Find swap quotes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Analyze portfolios</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 