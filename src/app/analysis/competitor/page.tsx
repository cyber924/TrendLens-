
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Search, Lightbulb, ThumbsUp, ThumbsDown, Target, Shield, FileText, Sparkles, UserSearch } from 'lucide-react';
import { analyzeCompetitorSwot, AnalyzeCompetitorSwotOutput } from '@/ai/flows/analyze-competitor-swot';
import { KeyMetricsCard } from '@/components/analysis/KeyMetricsCard';

const SwotSection = ({ title, items, icon }: { title: string, items: string[], icon: React.ReactNode }) => (
    <Card className="border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b-2 border-slate-900 py-3">
          <CardTitle className="text-xs font-bold flex items-center">
              {icon}
              <span className="ml-2">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="list-disc list-inside text-slate-600 font-medium text-[11px] space-y-2">
              {items.map((item, index) => <li key={index} className="leading-relaxed">{item}</li>)}
          </ul>
        </CardContent>
    </Card>
);


export default function CompetitorAnalysisPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeCompetitorSwotOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({ variant: "destructive", title: "URL 필요", description: "분석할 경쟁사 상품의 URL을 입력해주세요." });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const response = await analyzeCompetitorSwot({ productUrl: url });
      setResult(response);
    } catch (error: any) {
      console.error("경쟁사 분석 오류:", error);
      toast({
        variant: "destructive",
        title: "분석 실패",
        description: error.message || "경쟁사 상품을 분석하는 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Wide Hero Section - Improved */}
      <section className="w-full bg-[#f1f4f9] border-b-2 border-slate-200 py-16 mb-12">
          <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 text-indigo-700 text-[10px] font-black mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest animate-in slide-in-from-top-4 duration-500">
                    <UserSearch className="h-3.5 w-3.5" /> Market Rival Insight
                </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                  AI <span className="text-indigo-600">경쟁사 상품</span> 분석
              </h1>
              <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                  경쟁사 상품 URL을 입력하면, AI가 상세페이지를 스크랩하고 분석하여 <br />
                  SWOT 분석, 가격 지표 및 우리가 취해야 할 즉각적인 실행 전략을 도출합니다.
              </p>
          </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">분석 요청</CardTitle>
                    <CardDescription className="text-[11px] font-medium text-slate-400">경쟁사 상품 URL을 입력하세요.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                    <Label htmlFor="url" className="text-[11px] font-bold text-slate-700 uppercase">Target URL</Label>
                    <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com/product/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        className="border-2 border-slate-200"
                    />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full font-black bg-indigo-600 hover:bg-indigo-700 h-11 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    라이벌 분석 시작
                    </Button>
                </CardFooter>
                </form>
            </Card>
            </div>

            <div className="lg:col-span-2">
            <Card className="min-h-full border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b-2 border-slate-900">
                    <CardTitle className="text-xl font-bold">AI 분석 리포트</CardTitle>
                    <CardDescription className="text-[11px] font-medium text-slate-500">{result ? `'${result.productName}' 분석 결과` : '경쟁사 데이터가 여기에 표시됩니다.'}</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-96">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                    <p className="text-slate-900 font-black uppercase">Deep Crawling & Analyzing...</p>
                    </div>
                )}
                {result ? (
                    <div className="space-y-10 animate-in fade-in-50">
                        <KeyMetricsCard price={result.keyMetrics.price} reviewCount={result.keyMetrics.reviewCount} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SwotSection title="강점 (Strengths)" items={result.strengths} icon={<ThumbsUp className="text-indigo-600 h-4 w-4" />} />
                        <SwotSection title="약점 (Weaknesses)" items={result.weaknesses} icon={<ThumbsDown className="text-rose-600 h-4 w-4" />} />
                        <SwotSection title="기회 (Opportunities)" items={result.opportunities} icon={<Target className="text-emerald-600 h-4 w-4" />} />
                        <SwotSection title="위협 (Threats)" items={result.threats} icon={<Shield className="text-amber-500 h-4 w-4" />} />
                        </div>

                        <Card className="border-2 border-slate-900 bg-indigo-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-base font-bold"><Lightbulb className="mr-2 text-indigo-600 h-5 w-5" />AI 전략적 제언</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 font-medium leading-relaxed text-xs">{result.summary}</p>
                            </CardContent>
                        </Card>
                    </div>
                ) : !loading && (
                    <div className="text-center text-slate-300 py-24 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-xl">
                    <Search className="h-16 w-16 mb-6 opacity-20" />
                    <p className="text-lg font-bold text-slate-900 uppercase">Ready to Spy</p>
                    <p className="text-[11px] font-medium mt-1">분석할 URL을 입력하고 버튼을 클릭하세요.</p>
                    </div>
                )}
                </CardContent>
            </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
