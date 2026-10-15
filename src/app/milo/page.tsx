
"use client";

import * as React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Sparkles, Bot, User, ArrowRight, Lightbulb, TrendingUp, Zap } from "lucide-react";
import { miloChat, MiloChatOutput } from "@/ai/flows/milo-chat-flow";
import { MarkdownReport } from "@/components/reports/MarkdownReport";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Message = {
  role: 'user' | 'model';
  text: string;
  action?: { label: string; href: string };
};

const SUGGESTIONS = [
  { label: "요즘 유행하는 패션 트렌드는?", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { label: "상세페이지 어떻게 기획해?", icon: <Lightbulb className="h-3.5 w-3.5" /> },
  { label: "신상품 자동 기획해줘", icon: <Zap className="h-3.5 w-3.5" /> },
];

export default function MiloAgentPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await miloChat({ history, message: textToSend });
      
      const miloMessage: Message = { 
        role: 'model', 
        text: response.response,
        action: response.suggestedAction 
      };
      setMessages(prev => [...prev, miloMessage]);
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "응답 실패", description: "마일로가 응답하는 중 오류가 발생했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingAuth) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /></div>;

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-50 border-2 border-slate-900 text-indigo-700 text-sm font-black mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Sparkles className="h-4 w-4" /> MILO AI 에이전트
        </div>
        <h1 className="text-4xl font-black font-headline text-slate-900">쇼핑 전략의 모든 것, 마일로에게 물어보세요</h1>
        <p className="text-slate-500 font-medium mt-2">트렌드 분석부터 메뉴 이동까지, 당신의 비즈니스를 가이드합니다.</p>
      </div>

      <Card className="flex-1 flex flex-col border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
        <CardHeader className="border-b-4 border-slate-900 bg-slate-50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Bot className="text-white h-6 w-6" />
             </div>
             <div>
                <CardTitle className="text-lg">마일로 AI 전략가</CardTitle>
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online & Ready</span>
                </div>
             </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 relative overflow-hidden">
          <ScrollArea ref={scrollRef} className="h-full p-6 bg-slate-50/50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-6">
                 <div className="w-20 h-20 bg-white border-2 border-slate-900 rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Bot className="h-10 w-10 text-indigo-600" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 uppercase">Milo is Here</h3>
                    <p className="text-slate-500 font-medium max-w-xs">무엇을 도와드릴까요? 분석, 기획, 마케팅 무엇이든 물어보세요.</p>
                 </div>
                 <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map(s => (
                      <Button key={s.label} variant="outline" size="sm" onClick={() => handleSendMessage(s.label)} className="border-2 border-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {s.icon} <span className="ml-2">{s.label}</span>
                      </Button>
                    ))}
                 </div>
              </div>
            )}
            
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                    m.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-900 rounded-tl-none"
                  )}>
                    <div className="flex items-center gap-2 mb-2 opacity-50">
                        {m.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                        <span className="text-[10px] font-black uppercase">{m.role}</span>
                    </div>
                    <MarkdownReport content={m.text} className={cn(m.role === 'user' ? "prose-invert" : "")} />
                    
                    {m.action && (
                        <div className="mt-4 pt-4 border-t-2 border-slate-100">
                           <Button asChild size="sm" className="w-full bg-slate-900 hover:bg-slate-800 text-white border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
                              <Link href={m.action.href}>
                                 {m.action.label} <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                           </Button>
                        </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    <span className="text-sm font-bold text-slate-500 animate-pulse">마일로가 생각 중입니다...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-6 bg-white border-t-4 border-slate-900">
           <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex w-full gap-4"
           >
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="전략적인 조언이 필요하신가요? 여기에 메시지를 입력하세요..."
                className="flex-1 h-14 border-2 border-slate-900 focus-visible:ring-indigo-600 font-bold"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="h-14 w-14 border-2 border-slate-900 bg-indigo-600 hover:bg-indigo-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Send className="h-6 w-6" />
              </Button>
           </form>
        </CardFooter>
      </Card>
    </div>
  );
}
