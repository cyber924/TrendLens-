
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Wand2, Save, Sparkles } from 'lucide-react';
import { analyzePersonaProduct, AnalyzePersonaProductOutput } from '@/ai/flows/analyze-persona-product';
import { MarkdownReport } from '@/components/reports/MarkdownReport';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


export default function PersonaAnalysisPage() {
  const [persona, setPersona] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<AnalyzePersonaProductOutput | null>(null);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await analyzePersonaProduct({ persona, category });
      setResult(response);
    } catch (error) {
      console.error("페르소나 분석 오류:", error);
      toast({
        variant: "destructive",
        title: "분석 실패",
        description: "페르소나 기반 상품 기획안을 생성하는 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveReport = async () => {
    if (!result || !user) {
       toast({
        variant: "destructive",
        title: "저장 실패",
        description: "저장할 결과가 없거나 로그인이 필요합니다.",
      });
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, "persona_reports"), {
        persona,
        category,
        report: result.report,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });
       toast({
        title: "분석 결과 저장됨",
        description: "'내 문서' 페이지에서 확인할 수 있습니다.",
      });
    } catch (error) {
       console.error("Error saving report: ", error);
       toast({
        variant: "destructive",
        title: "저장 오류",
        description: "리포트를 저장하는 중 오류가 발생했습니다.",
      });
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
                    <Users className="h-3.5 w-3.5" /> Customer Psychology Lab
                </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                  AI <span className="text-indigo-600">페르소나</span> 분석실
              </h1>
              <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                  타겟 고객의 라이프스타일과 가치관을 입력하면, AI가 그들의 깊은 니즈를 분석하여 <br />
                  마음을 움직이는 최적의 상품 기획안과 소구 포인트를 도출합니다.
              </p>
          </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
            <Card className="sticky top-20 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">분석 요청</CardTitle>
                    <CardDescription className="text-[11px] font-medium text-slate-400">타겟 고객과 상품 분야를 알려주세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="persona" className="text-[11px] font-bold text-slate-700 uppercase">타겟 고객 페르소나</Label>
                    <Textarea 
                        id="persona" 
                        placeholder="예: 환경에 관심 많은 30대 여성, 미니멀 라이프스타일 추구" 
                        value={persona} 
                        onChange={(e) => setPersona(e.target.value)} 
                        required 
                        className="h-32 border-2 border-slate-200"
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="category" className="text-[11px] font-bold text-slate-700 uppercase">상품 카테고리</Label>
                    <Input 
                        id="category" 
                        placeholder="예: 여성의류, 가방, 신발" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        required 
                        className="border-2 border-slate-200"
                    />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full h-11 font-black bg-indigo-600 hover:bg-indigo-700 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" disabled={loading || !persona || !category}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    기획안 생성
                    </Button>
                </CardFooter>
                </form>
            </Card>
            </div>

            <div className="md:col-span-2">
            <Card className="min-h-full flex flex-col border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b-2 border-slate-900">
                <CardTitle className="text-xl font-bold">AI 생성 기획안</CardTitle>
                <CardDescription className="text-[11px] font-medium text-slate-500">AI가 생성한 페르소나 맞춤형 상품 기획안입니다.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-8">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-96">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-slate-900 font-black uppercase">Analyzing Persona...</p>
                    </div>
                )}
                {result ? (
                    <div className="space-y-8 animate-in fade-in-50">
                        <MarkdownReport content={result.report} />
                    </div>
                ) : !loading && (
                    <div className="text-center text-muted-foreground py-24 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <Users className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-lg font-bold text-slate-900 uppercase">Analysis Pending</p>
                    <p className="text-[11px] font-medium mt-2 text-slate-400">위 양식에 정보를 입력하고 버튼을 눌러주세요.</p>
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
                            onClick={handleSaveReport}
                            disabled={!result || !user || isSaving || loading}
                            className="w-full h-12 text-base font-black bg-slate-900 hover:bg-slate-800 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            기획안 저장하기
                            </Button>
                        </span>
                        </TooltipTrigger>
                        {!user ? (
                        <TooltipContent className="bg-rose-600 text-white font-bold border-2 border-slate-900"><p>저장하려면 로그인이 필요합니다.</p></TooltipContent>
                        ) : !result && (
                        <TooltipContent className="font-bold border-2 border-slate-900"><p>저장할 기획안이 없습니다.</p></TooltipContent>
                        )}
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
