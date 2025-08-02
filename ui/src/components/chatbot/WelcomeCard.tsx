import { MessageCircle, Zap, TrendingUp, Shield, Sparkles } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function WelcomeCard() {
  const features = [
    {
      icon: Zap,
      title: "Check wallet balances",
      description: "Get real-time balance information"
    },
    {
      icon: TrendingUp,
      title: "Get token prices",
      description: "Live price data and charts"
    },
    {
      icon: MessageCircle,
      title: "Find swap quotes",
      description: "Best rates across DEXs"
    },
    {
      icon: Shield,
      title: "Analyze portfolios",
      description: "Comprehensive portfolio insights"
    }
  ];

  return (
    <Card className="border-dashed border-border/50 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm hover:border-border/70 transition-all duration-300">
      <CardContent className="pt-8 pb-6">
        <div className="text-center space-y-8">
          {/* Header */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mx-auto shadow-lg hover:shadow-xl transition-all duration-300">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          {/* Title */}
          <div className="space-y-3">
            <h3 className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Welcome to Doraemon!
            </h3>
            <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your intelligent AI assistant for all things DeFi and blockchain. 
              Ask me anything about tokens, wallets, or trading strategies.
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <Button 
              variant="default" 
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Chatting
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-border/50 hover:border-border transition-all duration-200"
            >
              View Examples
            </Button>
          </div>
          
          {/* Footer */}
          <div className="pt-6">
            <p className="text-xs text-muted-foreground/70 max-w-sm mx-auto">
              Start by asking me anything about DeFi, tokens, or blockchain! 
              I'm here to help you navigate the world of decentralized finance.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 