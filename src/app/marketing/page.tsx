
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateMarketingContent, GenerateMarketingContentOutput } from "@/ai/flows/generate-marketing-content";
import { Loader2, Wand2, Lightbulb, Save, Megaphone, Sparkles } from "lucide-react";
import { MarkdownReport } from "@/components/reports/MarkdownReport";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function MarketingAssistantPage() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<GenerateMarketingContentOutput | null>(null);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await generateMarketingContent({
        productName,
        productDescription,
        targetAudience,
      });
      setResult(response);
    } catch (error) {
      console.error("콘텐츠 생성 오류:", error);
      toast({
        variant: "destructive",
        title: "생성 실패",
        description: "마케팅 플랜을 생성하는 중 오류가 발생했습니다. 다시 시도해 주세요.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSavePlan = async () => {
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
      await addDoc(collection(db, "marketing_plans"), {
        productName,
        productDescription,
        targetAudience,
        report: result.report,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });
      toast({
        title: "마케팅 플랜 저장됨",
        description: "'나의 마케팅 플랜' 페이지에서 확인할 수 있습니다.",
      });
    } catch (error) {
      console.error("Error saving plan: ", error);
      toast({
        variant: "destructive",
        title: "저장 오류",
        description: "플랜을 저장하는 중 오류가 발생했습니다.",
      });
    } finally {
      setIsSaving(false);
    }
  };


  const isFormInvalid = !productName || !productDescription || !targetAudience;

  return (
    <div className="w-full">
      {/* Wide Hero Section - Improved */}
      <section className="w-full bg-[#f1f4f9] border-b-2 border-slate-200 py-16 mb-12">
          <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 text-indigo-700 text-[10px] font-black mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest animate-in slide-in-from-top-4 duration-500">
                    <Megaphone className="h-3.5 w-3.5" /> High-Conversion Strategist
                </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                  AI <span className="text-indigo-600">마케팅</span> 전략가
              </h1>
              <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                  제품 정보와 타겟 고객을 입력하면, AI가 SNS 콘텐츠부터 광고 키워드까지 <br />
                  매출을 극대화하는 종합적인 마케팅 캠페인 플랜을 즉시 생성합니다.
              </p>
          </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
            <Card className="sticky top-20 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">캠페인 정보</CardTitle>
                    <CardDescription className="text-[11px] font-medium text-slate-400">성공적인 캠페인을 위해 정보를 입력하세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="productName" className="text-[11px] font-bold text-slate-700 uppercase">제품명</Label>
                    <Input id="productName" placeholder="예: 리사이클 코튼 에코백" value={productName} onChange={(e) => setProductName(e.target.value)} required className="border-2 border-slate-200" />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="productDescription" className="text-[11px] font-bold text-slate-700 uppercase">제품 설명</Label>
                    <Textarea id="productDescription" placeholder="제품의 핵심 특징과 장점을 설명해주세요." value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required className="h-24 border-2 border-slate-200" />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="targetAudience" className="text-[11px] font-bold text-slate-700 uppercase">타겟 고객</Label>
                    <Textarea id="targetAudience" placeholder="예: 환경에 관심 많은 20대 대학생" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} required className="h-24 border-2 border-slate-200" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full h-11 font-black bg-indigo-600 hover:bg-indigo-700 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" disabled={loading || isFormInvalid}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    전략 생성 시작
                    </Button>
                </CardFooter>
                </form>
            </Card>
            </div>

            <div className="md:col-span-2">
            <Card className="min-h-full flex flex-col border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b-2 border-slate-900">
                <CardTitle className="text-xl font-bold">AI 생성 마케팅 플랜</CardTitle>
                <CardDescription className="text-[11px] font-medium text-slate-500">AI가 제안하는 종합 마케팅 전략 리포트입니다.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-8">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-96">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                    <p className="text-slate-900 font-black uppercase">Strategizing Growth...</p>
                    </div>
                )}
                {result ? (
                    <div className="p-6 border-2 border-slate-900 rounded-xl bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <MarkdownReport content={result.report} />
                    </div>
                ) : !loading && (
                    <div className="text-center text-slate-300 py-32 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <Megaphone className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-lg font-bold text-slate-900 uppercase">No Strategy Generated</p>
                    <p className="text-[11px] font-medium mt-2 text-slate-400">왼쪽 양식을 모두 채우고 버튼을 눌러주세요.</p>
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
                                플랜 영구 저장
                            </Button>
                            </span>
                        </TooltipTrigger>
                        {!user ? (
                            <TooltipContent className="border-2 border-slate-900 font-bold bg-rose-600 text-white"><p>저장하려면 로그인이 필요합니다.</p></TooltipContent>
                        ) : !result && (
                            <TooltipContent className="border-2 border-slate-900 font-bold"><p>저장할 마케팅 플랜이 없습니다.</p></TooltipContent>
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
