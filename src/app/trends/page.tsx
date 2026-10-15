
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { analyzeMarketTrends, AnalyzeMarketTrendsOutput } from "@/ai/flows/analyze-market-trends";
import { Loader2, Zap, Tag, Palette, ShoppingBag, Save, Calendar as CalendarIcon, Sparkles, TrendingUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { useAuthState } from "react-firebase-hooks/auth";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

export default function TrendAnalysisPage() {
  const [platform, setPlatform] = useState("Naver");
  const [category, setCategory] = useState("여성의류");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<AnalyzeMarketTrendsOutput | null>(null);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date?.from || !date?.to) {
        toast({ variant: "destructive", title: "기간 선택 필요", description: "분석할 날짜 구간을 선택해주세요." });
        return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await analyzeMarketTrends({
        platform: platform as 'Naver' | 'Coupang' | 'Zigzag',
        category: category,
        startDate: format(date.from, "yyyy-MM-dd"),
        endDate: format(date.to, "yyyy-MM-dd"),
      });
      setResult(response);
      toast({ title: "분석 완료", description: "최신 트렌드 데이터가 도출되었습니다." });
    } catch (error: any) {
      console.error("시장 동향 분석 오류:", error);
      toast({
        variant: "destructive",
        title: "분석 실패",
        description: error.message || "시장 동향을 분석할 수 없습니다. 다시 시도해 주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!result || !user || !date?.from || !date?.to) {
       toast({
        variant: "destructive",
        title: "저장 실패",
        description: "저장할 결과가 없거나 로그인이 필요합니다.",
      });
      return;
    }
    setIsSaving(true);
    try {
      const timeframeStr = `${format(date.from, "yy.MM.dd")} ~ ${format(date.to, "yy.MM.dd")}`;
      await addDoc(collection(db, "trend_reports"), {
        title: `${category} 트렌드 분석 (${platform})`,
        category: category,
        platform: platform,
        timeframe: timeframeStr,
        startDate: format(date.from, "yyyy-MM-dd"),
        endDate: format(date.to, "yyyy-MM-dd"),
        keywords: result.topKeywords.map(k => k.item),
        materials: result.topMaterials.map(m => m.item),
        colors: result.topColors.map(c => c.item),
        fullResult: result,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });
       toast({
        title: "분석 결과 저장됨",
        description: "내 문서함에서 확인하실 수 있습니다.",
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
                    <TrendingUp className="h-3.5 w-3.5" /> 2025 Market Intelligence
                </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                  AI <span className="text-indigo-600">정밀 트렌드</span> 분석기
              </h1>
              <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                  주요 이커머스 플랫폼의 데이터를 기간별로 정확히 지정하여 <br />
                  상승 기류를 타는 핵심 키워드와 소재, 컬러를 정밀 분석합니다.
              </p>
          </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
            <Card className="border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                <CardHeader>
                <CardTitle className="text-xl font-bold">분석 파라미터</CardTitle>
                <CardDescription className="text-[11px] font-medium text-slate-400">플랫폼과 상세 기간을 설정하세요.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                    <Label htmlFor="platform" className="text-[11px] font-bold text-slate-700 uppercase">플랫폼</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger className="border-2 border-slate-200">
                        <SelectValue placeholder="플랫폼 선택" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Naver">네이버 쇼핑</SelectItem>
                        <SelectItem value="Coupang">쿠팡</SelectItem>
                        <SelectItem value="Zigzag">지그재그</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                    
                    <div className="space-y-2">
                    <Label htmlFor="category" className="text-[11px] font-bold text-slate-700 uppercase">제품 카테고리</Label>
                    <Input 
                        id="category" 
                        placeholder="예: 드레스, 셔츠, 린넨" 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border-2 border-slate-200"
                    />
                    </div>

                    <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-700 uppercase">분석 기간</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal border-2 border-slate-200",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                            date.to ? (
                                <>
                                {format(date.from, "LLL dd, y", { locale: ko })} -{" "}
                                {format(date.to, "LLL dd, y", { locale: ko })}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y", { locale: ko })
                            )
                            ) : (
                            <span>날짜 구간을 선택하세요</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                            locale={ko}
                        />
                        </PopoverContent>
                    </Popover>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full h-11 text-base font-black bg-indigo-600 hover:bg-indigo-700 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                    분석 실행
                    </Button>
                </CardFooter>
                </form>
            </Card>
            </div>

            <div className="md:col-span-2">
            <Card className="min-h-full flex flex-col border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                <CardHeader className="bg-slate-50 border-b-2 border-slate-900">
                <CardTitle className="text-xl font-bold">AI 분석 결과</CardTitle>
                <CardDescription className="text-[11px] font-medium text-slate-500">
                    {date?.from && date?.to ? (
                        `${format(date.from, "yyyy.MM.dd")} ~ ${format(date.to, "yyyy.MM.dd")} 기간 데이터`
                    ) : '분석을 기다리는 중...'}
                </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-6">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium animate-pulse">최신 시장 데이터를 수집하고 있습니다...</p>
                    </div>
                )}
                {result && (
                    <div className="space-y-8 animate-in fade-in-50 duration-500">
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Tag className="h-5 w-5 text-indigo-600" />
                            상위 급상승 키워드
                        </h3>
                        <Accordion type="single" collapsible className="w-full space-y-3">
                        {result.topKeywords.map((item, index) => (
                            <AccordionItem value={`kw-${index}`} key={index} className="border-2 border-slate-900 rounded-lg px-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <AccordionTrigger className="text-sm font-bold py-3 hover:no-underline">{item.item}</AccordionTrigger>
                            <AccordionContent className="pb-4 space-y-4">
                                <div className="text-slate-600 text-xs leading-relaxed border-l-4 border-indigo-200 pl-4 font-medium">
                                    {item.description}
                                </div>
                                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex gap-3 items-start">
                                    <ShoppingBag className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">PROPOSED IDEA</p>
                                        <p className="text-xs font-bold text-slate-800 leading-normal">{item.productIdea}</p>
                                    </div>
                                </div>
                            </AccordionContent>
                            </AccordionItem>
                        ))}
                        </Accordion>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-amber-500" />
                            주목해야 할 소재
                        </h3>
                        <Accordion type="single" collapsible className="w-full space-y-3">
                        {result.topMaterials.map((item, index) => (
                            <AccordionItem value={`mat-${index}`} key={index} className="border-2 border-slate-900 rounded-lg px-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <AccordionTrigger className="text-sm font-bold py-3 hover:no-underline">{item.item}</AccordionTrigger>
                            <AccordionContent className="pb-4 space-y-4">
                                <div className="text-slate-600 text-xs leading-relaxed border-l-4 border-amber-200 pl-4 font-medium">
                                    {item.description}
                                </div>
                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex gap-3 items-start">
                                    <ShoppingBag className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">PROPOSED IDEA</p>
                                        <p className="text-xs font-bold text-slate-800 leading-normal">{item.productIdea}</p>
                                    </div>
                                </div>
                            </AccordionContent>
                            </AccordionItem>
                        ))}
                        </Accordion>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Palette className="h-5 w-5 text-rose-500" />
                            시즌 트렌드 컬러
                        </h3>
                        <Accordion type="single" collapsible className="w-full space-y-3">
                        {result.topColors.map((item, index) => (
                            <AccordionItem value={`col-${index}`} key={index} className="border-2 border-slate-900 rounded-lg px-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <AccordionTrigger className="text-sm font-bold py-3 hover:no-underline">{item.item}</AccordionTrigger>
                            <AccordionContent className="pb-4 space-y-4">
                                <div className="text-slate-600 text-xs leading-relaxed border-l-4 border-rose-200 pl-4 font-medium">
                                    {item.description}
                                </div>
                                <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg flex gap-3 items-start">
                                    <ShoppingBag className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">PROPOSED IDEA</p>
                                        <p className="text-xs font-bold text-slate-800 leading-normal">{item.productIdea}</p>
                                    </div>
                                </div>
                            </AccordionContent>
                            </AccordionItem>
                        ))}
                        </Accordion>
                    </div>
                    </div>
                )}
                {!loading && !result && (
                    <div className="text-center text-muted-foreground py-24 border-2 border-dashed border-slate-300 rounded-xl">
                    <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-bold text-slate-900 uppercase">분석 대기 중</p>
                    <p className="text-xs font-medium">기간을 선택하고 버튼을 누르면 AI 분석이 시작됩니다.</p>
                    </div>
                )}
                </CardContent>
                {result && (
                <CardFooter className="bg-slate-50 border-t-2 border-slate-900 py-4">
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="w-full"> 
                            <Button 
                                onClick={handleSaveReport} 
                                disabled={!result || !user || isSaving} 
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black h-12 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                분석 리포트 영구 저장
                            </Button>
                            </span>
                        </TooltipTrigger>
                        {!user && (
                            <TooltipContent className="bg-rose-600 text-white font-bold border-2 border-slate-900">
                                <p>저장하려면 로그인이 필요합니다.</p>
                            </TooltipContent>
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
