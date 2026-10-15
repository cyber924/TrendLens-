
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Lightbulb } from 'lucide-react';
import { generateProductIdea, GenerateProductIdeaOutput } from '@/ai/flows/generate-product-idea';
import { MarkdownReport } from '@/components/reports/MarkdownReport';
import Image from 'next/image';

export default function ProductIdeaDetailPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateProductIdeaOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await generateProductIdea(query);
      setResult(response);
    } catch (error) {
      console.error("제품 아이디어 생성 오류:", error);
      toast({
        variant: "destructive",
        title: "생성 실패",
        description: "제품 아이디어를 생성하는 중 오류가 발생했습니다. 다시 시도해 주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Wide Hero Section */}
      <section className="w-full bg-[#f1f4f9] border-b-2 border-slate-200 py-16 mb-12">
          <div className="container mx-auto px-4 text-center">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight font-headline text-slate-900 uppercase">AI 제품 상세 기획</h1>
              <p className="mt-2 text-sm md:text-base font-medium text-slate-500 max-w-2xl mx-auto">
                  아이디어를 입력하면, AI가 상세 기획안과 비주얼 컨셉 보드를 즉시 만들어 드립니다.
              </p>
          </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
            <Card className="sticky top-20 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">아이디어 요청</CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-400">어떤 제품을 기획해 볼까요?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                    <Label htmlFor="query" className="text-xs font-bold text-slate-700">아이디어 설명</Label>
                    <Input 
                        id="query" 
                        placeholder="예: 올여름 유행할 의류 상품" 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)} 
                        required 
                        className="border-slate-300"
                    />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full h-11 font-black bg-indigo-600 hover:bg-indigo-700 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    생성하기
                    </Button>
                </CardFooter>
                </form>
            </Card>
            </div>

            <div className="md:col-span-2">
            <Card className="min-h-full border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b-2 border-slate-900">
                <CardTitle className="text-xl font-bold">AI 생성 결과물</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">AI가 생성한 비주얼 컨셉과 상세 기획안입니다.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-96">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                    <p className="font-bold text-slate-900 uppercase">기획안 생성 중...</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">(최대 1분 정도 소요될 수 있습니다)</p>
                    </div>
                )}
                {result ? (
                    <div className="space-y-8 animate-in fade-in-50">
                    {result.images.length > 0 && (
                        <div>
                        <h2 className="text-lg font-black font-headline mb-4 text-slate-900 uppercase tracking-tighter">비주얼 컨셉 보드</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {result.images.map((image, index) => (
                                <div key={index} className="relative aspect-square border-2 border-slate-900 rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
                        </div>
                    )}
                    
                    {result.report && (
                        <div className="pt-8 border-t-2 border-slate-100">
                        <h2 className="text-lg font-black font-headline mb-4 text-slate-900 uppercase tracking-tighter">상세 기획 리포트</h2>
                        <div className="p-6 border-2 border-slate-900 rounded-xl bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <MarkdownReport content={result.report} />
                        </div>
                        </div>
                    )}
                    </div>
                ) : !loading && (
                    <div className="text-center text-slate-300 py-24 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <Lightbulb className="h-16 w-16 mb-6 opacity-20" />
                    <p className="text-lg font-bold text-slate-900 uppercase">아이디어 보드</p>
                    <p className="text-xs font-medium mt-2">왼쪽 양식에 아이디어를 입력하고 버튼을 눌러주세요.</p>
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
