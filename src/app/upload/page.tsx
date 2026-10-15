
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { analyzeProductData } from "@/ai/flows/analyze-product-data";
import { Loader2, TestTube2, BrainCircuit, Save, FileSpreadsheet, Sparkles } from "lucide-react";
import { MarkdownReport } from "@/components/reports/MarkdownReport";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const sampleCsvData = `Date,Category,Sales,Stock
2024-01-01,드레스,1200,80
2024-02-01,셔츠,1500,120
2024-03-01,드레스,1800,70
2024-04-01,청바지,2200,150
2024-05-01,셔츠,2100,90
2024-06-01,드레스,2800,50
`;

export default function CsvUploadPage() {
  const [csvText, setCsvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const resetState = () => {
    setCsvText("");
    setResult(null);
  }

  const runAnalysis = async (text: string) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await analyzeProductData({ csvText: text });
      setResult(response.analysisReport);
    } catch (error) {
      console.error("제품 데이터 분석 오류:", error);
      toast({
        variant: "destructive",
        title: "분석 실패",
        description: "제공된 CSV 데이터를 분석할 수 없습니다. 다시 시도하십시오.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      toast({
        variant: "destructive",
        title: "데이터 누락",
        description: "분석할 CSV 데이터를 먼저 붙여넣어 주세요.",
      });
      return;
    }
    await runAnalysis(csvText);
  };

  const handleSampleAnalysis = async () => {
    resetState();
    setCsvText(sampleCsvData);
    await runAnalysis(sampleCsvData);
  }
  
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
      await addDoc(collection(db, "product_data_reports"), {
        originalData: csvText,
        report: result,
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
                    <BrainCircuit className="h-3.5 w-3.5" /> Big Data Engine
                </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                  AI <span className="text-indigo-600">CSV 데이터</span> 분석
              </h1>
              <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                  보유 중인 판매 데이터를 붙여넣기만 하세요. AI가 보이지 않는 패턴을 분석하여 <br />
                  재고 관리, 판매 예측 및 매출 증대를 위한 핵심 지표 리포트를 즉시 생성합니다.
              </p>
          </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-1">
                <Card className="border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden sticky top-24">
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="bg-slate-50 border-b-2 border-slate-900">
                        <CardTitle className="text-xl font-bold">데이터 입력</CardTitle>
                        <CardDescription className="text-[11px] font-medium">분석할 CSV 데이터를 붙여넣으세요.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="csvData" className="text-[11px] font-bold text-slate-700 uppercase">CSV Raw Text</Label>
                                <Textarea 
                                    id="csvData"
                                    value={csvText}
                                    onChange={(e) => setCsvText(e.target.value)}
                                    placeholder="Date,Category,Sales,Stock..."
                                    className="h-64 font-mono text-xs border-2 border-slate-200 focus:border-slate-900"
                                />
                            </div>
                            <div className="text-center">
                                <Button type="button" variant="outline" onClick={handleSampleAnalysis} disabled={loading} className="w-full border-2 border-slate-900 font-bold hover:bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:shadow-none text-xs h-10">
                                    <TestTube2 className="mr-2 h-4 w-4" />
                                    샘플 데이터 테스트
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 pb-6">
                        <Button type="submit" className="w-full h-12 text-base font-black bg-indigo-600 hover:bg-indigo-700 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" disabled={loading || !csvText.trim()}>
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BrainCircuit className="mr-2 h-5 w-5" />}
                            패턴 분석 실행
                        </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>

            <div className="md:col-span-2">
                <Card className="min-h-full flex flex-col border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b-2 border-slate-900">
                    <CardTitle className="text-xl font-bold">분석 리포트</CardTitle>
                    <CardDescription className="text-[11px] font-medium text-slate-500">AI가 도출한 데이터 통찰 리포트입니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow pt-8">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                            <p className="text-slate-900 font-black uppercase">Deep Pattern Mining...</p>
                        </div>
                    )}
                    {result && (
                      <div className="animate-in fade-in-50 duration-500">
                        <MarkdownReport content={result} />
                      </div>
                    )}
                    {!loading && !result && (
                        <div className="text-center text-slate-300 py-32 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-2xl">
                            <FileSpreadsheet className="h-16 w-16 mb-6 opacity-20" />
                            <p className="text-lg font-bold text-slate-900 uppercase">Input Data Required</p>
                            <p className="text-[11px] font-medium mt-2 text-slate-400">분석할 데이터를 왼쪽 창에 입력해주세요.</p>
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
                                  리포트 영구 저장
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
