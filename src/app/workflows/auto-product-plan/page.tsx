
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Lightbulb, TrendingUp, BotMessageSquare, FileText, Save, Zap, Sparkles } from 'lucide-react';
import { generateAutomatedProductPlan, GenerateAutomatedProductPlanOutput } from '@/ai/flows/generate-automated-plan-flow';
import { MarkdownReport } from '@/components/reports/MarkdownReport';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/client';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function AutoProductPlanPage() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<GenerateAutomatedProductPlanOutput | null>(null);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) {
      toast({ variant: "destructive", title: "키워드 필요", description: "기획할 상품의 키워드를 입력해주세요." });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const response = await generateAutomatedProductPlan({ keyword });
      setResult(response);
      toast({ title: "통합 기획안 생성 완료!" });
    } catch (error: any) {
      console.error("자동화 플랜 생성 오류:", error);
      toast({
        variant: "destructive",
        title: "생성 실패",
        description: error.message || "자동화된 기획안을 생성하는 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!result || !user) {
        toast({ variant: 'destructive', title: '저장 실패', description: '저장할 결과가 없거나 로그인이 필요합니다.' });
        return;
    }
    setIsSaving(true);
    try {
        await addDoc(collection(db, 'automated_plans'), {
            keyword,
            ...result,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
        });
        toast({ title: '기획안 저장됨', description: '생성된 기획안이 "내 문서"에 저장되었습니다.' });
    } catch (error) {
        console.error("Error saving plan: ", error);
        toast({ variant: 'destructive', title: '저장 실패', description: '기획안을 저장하는 중 오류가 발생했습니다.' });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <div className="w-full">
      {/* Wide Hero Section - Improved */}
      <section className="w-full bg-[#f1f4f9] border-b-2 border-slate-200 py-16 mb-12">
          <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 text-indigo-700 text-[10px] font-black mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest animate-in slide-in-from-top-4 duration-500">
                    <Zap className="h-3.5 w-3.5" /> All-in-One Automation
                </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                  AI <span className="text-indigo-600">신상품</span> 자동 기획
              </h1>
              <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                  키워드 하나만으로 트렌드 분석부터 상품 아이디어 구상, 마케팅 전략 수립까지 <br />
                  비즈니스의 전 과정을 AI가 한 번에 연결하여 완벽한 통합 기획안을 제공합니다.
              </p>
          </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">자동 기획 요청</CardTitle>
                    <CardDescription className="text-[11px] font-medium text-slate-400">어떤 상품을 기획해 볼까요?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                    <Label htmlFor="keyword" className="text-[11px] font-bold text-slate-700 uppercase">상품 키워드</Label>
                    <Input 
                        id="keyword" 
                        placeholder="예: 여름 원피스, 캠핑 의자" 
                        value={keyword} 
                        onChange={(e) => setKeyword(e.target.value)} 
                        required 
                        className="border-2 border-slate-200"
                    />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full h-12 text-base font-black bg-indigo-600 hover:bg-indigo-700 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                    통합 프로세스 시작
                    </Button>
                </CardFooter>
                </form>
            </Card>
            </div>

            <div className="lg:col-span-2">
            <Card className="min-h-full flex flex-col border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b-2 border-slate-900">
                <CardTitle className="text-xl font-bold">AI 통합 기획 리포트</CardTitle>
                <CardDescription className="text-[11px] font-medium text-slate-500">트렌드, 상품, 마케팅 3단계 분석 결과입니다.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-8">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-96">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                    <p className="text-slate-900 font-black uppercase">Orchestrating Workflow...</p>
                    <p className="text-[11px] text-slate-400 font-bold mt-2">(최대 2분 정도 소요될 수 있습니다)</p>
                    </div>
                )}
                {result ? (
                    <Accordion type="multiple" defaultValue={['trends', 'idea', 'marketing']} className="w-full space-y-6">
                    
                    <AccordionItem value="trends" className="border-2 border-slate-900 rounded-xl px-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <AccordionTrigger className="text-base font-bold py-4 hover:no-underline"><TrendingUp className="mr-2 h-5 w-5 text-indigo-600"/>1. 트렌드 분석</AccordionTrigger>
                        <AccordionContent className="pb-6 space-y-4">
                        <div className="flex flex-wrap gap-2 pt-2">
                            {result.trendAnalysis.topKeywords.map(k => <Badge key={k.item} className="border-2 border-slate-900 bg-indigo-50 text-indigo-700 font-bold text-[10px]">{k.item}</Badge>)}
                            {result.trendAnalysis.topColors.map(c => <Badge key={c.item} className="border-2 border-slate-900 bg-rose-50 text-rose-700 font-bold text-[10px]">{c.item}</Badge>)}
                            {result.trendAnalysis.topMaterials.map(m => <Badge key={m.item} className="border-2 border-slate-900 bg-slate-50 text-slate-700 font-bold text-[10px]">{m.item}</Badge>)}
                        </div>
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                            <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                            AI가 분석한 결과, <strong>'{result.trendAnalysis.topKeywords[0].item}'</strong> 키워드의 상승세가 가장 뚜렷합니다. 이를 기반으로 최적의 상품 기획을 진행했습니다.
                            </p>
                        </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="idea" className="border-2 border-slate-900 rounded-xl px-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <AccordionTrigger className="text-base font-bold py-4 hover:no-underline"><Lightbulb className="mr-2 h-5 w-5 text-amber-500"/>2. 상품 아이디어</AccordionTrigger>
                        <AccordionContent className="pb-6 space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {result.productIdea.images.slice(0,3).map((image, index) => (
                                <div key={index} className="relative aspect-square border-2 border-slate-900 rounded-lg overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Image 
                                    src={image}
                                    alt={`AI generated concept image ${index + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover"
                                    data-ai-hint="fashion concept"
                                />
                                </div>
                            ))}
                        </div>
                        <div className="prose prose-slate max-w-none">
                            <MarkdownReport content={result.productIdea.report} />
                        </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="marketing" className="border-2 border-slate-900 rounded-xl px-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <AccordionTrigger className="text-base font-bold py-4 hover:no-underline"><BotMessageSquare className="mr-2 h-5 w-5 text-rose-500"/>3. 마케팅 전략</AccordionTrigger>
                        <AccordionContent className="pb-6">
                        <div className="prose prose-slate max-w-none">
                            <MarkdownReport content={result.marketingPlan.report} />
                        </div>
                        </AccordionContent>
                    </AccordionItem>

                    </Accordion>
                ) : !loading && (
                    <div className="text-center text-slate-300 py-32 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <Zap className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-lg font-bold text-slate-900 uppercase">Process Ready</p>
                    <p className="text-[11px] font-medium mt-2 text-slate-400">상품 키워드를 입력하고 마법 같은 통합 기획안을 확인하세요.</p>
                    </div>
                )}
                </CardContent>
                {result && (
                    <CardFooter className="bg-slate-50 border-t-2 border-slate-900 py-6">
                        <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="w-full">
                                    <Button
                                        onClick={handleSavePlan}
                                        disabled={!result || !user || isSaving || loading}
                                        className="w-full h-12 text-base font-black bg-slate-900 hover:bg-slate-800 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        통합 기획안 영구 저장
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {!user && <TooltipContent className="bg-rose-600 text-white font-bold border-2 border-slate-900"><p>저장하려면 로그인이 필요합니다.</p></TooltipContent>}
                            </Tooltip>
                        </TooltipProvider>
                    </CardFooter>
                )}
            </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
