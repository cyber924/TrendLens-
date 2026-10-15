
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, ArrowRight, TrendingUp, Gem, Footprints, Save, Sparkles, Utensils, Smartphone, Home, Tent, FileSearch } from 'lucide-react';
import { generateInsightReport } from '@/ai/flows/generate-insight-report';
import { MarkdownReport } from '@/components/reports/MarkdownReport';
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { useAuthState } from "react-firebase-hooks/auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const analysisTopics = [
  {
    icon: <TrendingUp className="h-6 w-6 text-indigo-600" />,
    title: "2026 S/S 여성 패션 및 라이징 스타일",
    description: "2026년 최신 런웨이와 스트리트 패션을 기반으로 이번 시즌 유행할 스타일, 컬러, 아이템을 심층 분석합니다."
  },
  {
    icon: <Footprints className="h-6 w-6 text-indigo-600" />,
    title: "2026 프리미엄 스니커즈 & 슈즈 트렌드",
    description: "테크웨어 및 하이브리드 슈즈부터 2026년 가장 주목받는 신발 디자인과 브랜드를 분석합니다."
  },
  {
    icon: <Sparkles className="h-6 w-6 text-indigo-600" />,
    title: "2026 K-뷰티 클린뷰티 & 하이퍼테크",
    description: "최신 피부 과학 기술과 바이오 성분 트렌드를 분석하여 2026년 소비자 니즈가 집중되는 뷰티 트렌드를 도출합니다."
  },
  {
    icon: <Utensils className="h-6 w-6 text-indigo-600" />,
    title: "2026 헬시 플레저 및 기능성 푸드 동향",
    description: "즐겁게 건강을 관리하는 2026년 트렌드에 발맞춰, 급상승 중인 웰니스 식품 키워드를 제안합니다."
  },
  {
    icon: <Smartphone className="h-6 w-6 text-indigo-600" />,
    title: "2026 AI 가전 및 스마트 홈테크 트렌드",
    description: "생성형 AI와 차세대 IoT 기술이 접목된 2026년 디지털 가전 시장의 흐름을 분석합니다."
  },
  {
    icon: <Home className="h-6 w-6 text-indigo-600" />,
    title: "2026 미니멀 인테리어 및 공간 디자인",
    description: "하이브리드 라이프스타일을 영위하는 현대인들을 위한 2026년 공간 효율 중심의 가구 유행을 예측합니다."
  },
  {
    icon: <Gem className="h-6 w-6 text-indigo-600" />,
    title: "2026 하이엔드 주얼리 & 에센셜 액세서리",
    description: "소재, 지속가능성, 미니멀 디자인을 중심으로 2026년 주얼리 및 액세서리 트렌드를 미리 살펴봅니다."
  },
  {
    icon: <Tent className="h-6 w-6 text-indigo-600" />,
    title: "2026 어반 아웃도어 및 고프코어 마켓",
    description: "일상과 아웃도어의 경계가 사라진 2026년 고프코어 룩과 캠핑 기어 시장의 인기 아이템을 분석합니다."
  },
];

export default function LiveAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const handleTopicSelect = async (topicTitle: string) => {
    setLoading(true);
    setResult(null);
    setSelectedTopic(topicTitle);

    try {
      const response = await generateInsightReport(topicTitle);
      setResult(response);
    } catch (error) {
      console.error("실시간 분석 오류:", error);
      toast({
        variant: "destructive",
        title: "분석 실패",
        description: "실시간 동향 보고서를 생성하는 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!result || !selectedTopic || !user) {
       toast({
        variant: "destructive",
        title: "저장 실패",
        description: "저장할 결과가 없거나 로그인이 필요합니다.",
      });
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, "insight_reports"), {
        query: selectedTopic,
        report: result,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });
       toast({
        title: "분석 결과 저장됨",
        description: "인사이트 리포트가 성공적으로 저장되었습니다.",
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


  const handleBack = () => {
    setResult(null);
    setSelectedTopic(null);
  }

  return (
    <div className="w-full">
      {/* Wide Hero Section - Improved */}
      <section className="w-full bg-[#f1f4f9] border-b-2 border-slate-200 py-16 mb-12">
          <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 text-indigo-700 text-[10px] font-black mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest animate-in slide-in-from-top-4 duration-500">
                    <FileSearch className="h-3.5 w-3.5" /> Real-time Web Crawler
                </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                  AI <span className="text-indigo-600">실시간 동향</span> 분석
              </h1>
              <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                  궁금한 주제를 선택하면, AI가 지금 이 순간의 웹 데이터를 실시간 검색하고 <br />
                  가장 정밀한 근거 기반의 심층 보고서를 생성합니다.
              </p>
          </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 pb-20">
        {result ? (
            <div className="animate-in fade-in-50">
            <Card className="border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                <CardHeader className="border-b-2 border-slate-900">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <Button variant="outline" onClick={handleBack} className="mb-4 border-2 border-slate-900 font-bold hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-8 text-[10px] uppercase">
                        <ArrowRight className="h-3 w-3 mr-1.5 transform rotate-180" />
                        Back to Topics
                        </Button>
                        <CardTitle className="text-xl text-slate-900 font-black">"{selectedTopic}" 분석 리포트</CardTitle>
                        <CardDescription className="text-[11px] font-medium text-slate-400">AI가 실시간 웹 정보를 분석하여 생성한 결과입니다.</CardDescription>
                    </div>
                    <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <span className="w-full sm:w-auto"> 
                            <Button 
                            onClick={handleSaveReport} 
                            disabled={!result || !user || isSaving} 
                            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black h-11 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                보고서 저장
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
                </div>
                </CardHeader>
                <CardContent className="pt-8">
                <MarkdownReport content={result} />
                </CardContent>
            </Card>
            </div>
        ) : loading ? (
            <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-900 text-lg font-black uppercase">Analyzing Intelligence...</p>
                <p className="text-[11px] text-slate-400 font-bold mt-2">"{selectedTopic}"에 대한 최신 데이터를 수집 중입니다.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in-50">
            {analysisTopics.map((topic, index) => (
                <Card key={index} className="flex flex-col justify-between border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all bg-white group">
                <CardHeader className="pb-3">
                    <div className="mb-4 p-3 bg-slate-50 w-fit rounded-xl border-2 border-slate-200 group-hover:scale-110 transition-transform">{topic.icon}</div>
                    <CardTitle className="text-slate-900 text-base font-bold">{topic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-500 text-[11px] font-medium leading-relaxed line-clamp-3">{topic.description}</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full font-black bg-indigo-600 hover:bg-indigo-700 h-10 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" onClick={() => handleTopicSelect(topic.title)}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    리포트 생성
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
        )}
      </div>
    </div>
  );
}
