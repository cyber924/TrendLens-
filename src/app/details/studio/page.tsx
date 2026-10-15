
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Download, Save, Sparkles, FileArchive, Info, Image as ImageIcon, CheckCircle2, AppWindow } from 'lucide-react';
import { generateDetailContent } from '@/ai/flows/generate-detail-content-flow';
import { generateProductImage } from '@/ai/flows/generate-product-image-flow';
import type { DetailPageContent } from '@/lib/detail-page/schema';
import { PageWrapper } from '@/components/detail-pages/PageWrapper';
import { Page1Hero } from '@/components/detail-pages/Page1Hero';
import { Page2Problem } from '@/components/detail-pages/Page2Problem';
import { Page4Detail } from '@/components/detail-pages/Page4Detail';
import { Page8CTA } from '@/components/detail-pages/Page8CTA';
import { downloadSinglePage, downloadAllPages, downloadCombinedImage } from '@/lib/page-export';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '@/lib/firebase/client';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const TEMPLATES = [
  {
    id: 'minimal',
    name: '미니멀 (1페이지)',
    pages: 1,
    description: '핵심 정보만 한 페이지에 담은 심플한 구성',
    sections: [1],
  },
  {
    id: 'standard',
    name: '스탠다드 (4페이지)',
    pages: 4,
    description: '공감, 해결, 기능, 신뢰가 균형 잡힌 기본 구성',
    sections: [1, 2, 4, 8],
    badge: '추천',
  },
];

const AI_RECOMMENDATIONS = [
  {
    productInfo: "제품명: 올데이 프리미엄 실크 블라우스\n소재: 100% 천연 실크\n특징: 은은한 광택과 부드러운 터치감, 구김 방지 특수 가공, 세련된 오버사이즈 핏\n컬러: 샴페인 골드, 진주 화이트, 미드나잇 네이비",
    strategy: "30대 전문직 여성을 타겟으로, 소재의 고급스러움이 느껴지는 절제된 문체를 사용해줘. 무신사 매거진 스타일로 부탁해."
  },
  {
    productInfo: "제품명: 프렌치 워싱 프리미엄 린넨 셔츠\n특징: 프랑스산 최고급 린넨, 자연스러운 구김 디테일, 통기성 극대화, 여유로운 세미 오버핏",
    strategy: "내추럴하고 편안한 무드를 추구하는 2030 남녀 공용 아이템으로 기획해줘. '여름의 온도를 낮추는 한 장의 셔츠'라는 컨셉으로 작성해줘."
  },
  {
    productInfo: "제품명: 유기농 순면 아기 세제\n특징: 99.9% 자연 유래 성분, 민감성 피부 저자극 테스트 완료, 에코서트 인증, 고농축 알뜰 사용",
    strategy: "초보 부모를 타겟으로, '가장 순수한 보호'라는 테마를 사용해줘. 깨끗하고 신뢰감 있는 느낌으로 작성해줘."
  }
];

export default function StudioPage() {
  const [productInfo, setProductInfo] = useState('');
  const [strategy, setStrategy] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[1]);
  
  const [generationState, setGenerationState] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [content, setContent] = useState<DetailPageContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [imageGeneratingPath, setImageGeneratingPath] = useState<string | null>(null);
  
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const compressImage = async (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    });
  };

  const handleAiRecommend = () => {
    const randomIdx = Math.floor(Math.random() * AI_RECOMMENDATIONS.length);
    const recommendation = AI_RECOMMENDATIONS[randomIdx];
    setProductInfo(recommendation.productInfo);
    setStrategy(recommendation.strategy);
    toast({ title: "추천 데이터 입력 완료" });
  };

  const startGeneration = async () => {
    if (!productInfo) {
      toast({ variant: "destructive", title: "상품 정보 필요", description: "분석할 상품의 정보를 입력해주세요." });
      return;
    }
    setGenerationState('generating');
    setContent(null);

    try {
        const result = await generateDetailContent({
            productInfo,
            strategy: strategy || '매거진 스타일의 절제된 톤으로 고객의 감성을 자극하는 방향으로 작성해줘.',
        });
        setContent(result);
        setGenerationState('completed');
        toast({ title: "페이지 구성 완료" });
    } catch (error: any) {
        console.error(error);
        setGenerationState('error');
        toast({ variant: "destructive", title: "생성 실패", description: error.message });
    }
  };

  const handleGenerateImage = async (template: string, variables: Record<string, string>, path: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: '로그인 필요', description: '이미지를 생성하고 저장하려면 로그인이 필요합니다.' });
      return;
    }

    setImageGeneratingPath(path);
    try {
      const finalVariables = { ...variables };
      if (productInfo.includes('세제') || productInfo.includes('식품')) {
          finalVariables.vibe = 'clean, organic, minimal, household product';
      }

      const base64Image = await generateProductImage({ template: template as any, variables: finalVariables });
      const compressedImage = await compressImage(base64Image);

      const fileName = `page_${Date.now()}.jpg`;
      const storagePath = `detail_images/${user.uid}/${fileName}`;
      const storageRef = ref(storage, storagePath);
      await uploadString(storageRef, compressedImage, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'studio_images'), {
          userId: user.uid,
          downloadURL,
          storagePath,
          fileName,
          template: template,
          variables: finalVariables,
          createdAt: serverTimestamp(),
      });

      const newContent = JSON.parse(JSON.stringify(content));
      const keys = path.replace(/\]/g, '').split(/[.\[]/);
      let current = newContent;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = downloadURL;
      
      setContent(newContent);
      toast({ title: "이미지 생성 및 갤러리 저장 완료" });
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: '이미지 생성 실패', description: error.message });
    } finally {
      setImageGeneratingPath(null);
    }
  };

  const handleSavePage = async () => {
    if (!user || !content) return;
    setIsSaving(true);
    try {
        const sanitizedContent = JSON.parse(JSON.stringify(content));
        await addDoc(collection(db, 'structured_pages'), {
            productInfo,
            strategy,
            template: selectedTemplate.name,
            content: sanitizedContent,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
        });
        toast({ title: '페이지 저장됨' });
    } catch (error) {
        console.error("Error saving page: ", error);
        toast({ variant: 'destructive', title: '저장 실패', description: '데이터 저장 중 오류가 발생했습니다.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleSingleDownload = async (pageNum: number) => {
    setDownloading(`page-${pageNum}`);
    try {
      await downloadSinglePage(pageNum, content?.productName || 'product');
      toast({ title: `${pageNum}페이지 다운로드 완료` });
    } catch (e) {
      console.error("Single download error:", e);
      toast({ variant: 'destructive', title: '다운로드 실패' });
    } finally {
      setDownloading(null);
    }
  };

  const handleZipDownload = async () => {
    setDownloading('zip');
    try {
      await downloadAllPages(selectedTemplate.pages, content?.productName || 'product');
      toast({ title: '전체 ZIP 다운로드 완료' });
    } catch (e) {
      console.error("ZIP download error:", e);
      toast({ variant: 'destructive', title: '압축 실패' });
    } finally {
      setDownloading(null);
    }
  };

  const handleCombinedDownload = async () => {
    setDownloading('combined');
    try {
      await downloadCombinedImage(selectedTemplate.pages, content?.productName || 'product');
      toast({ title: '합본 이미지 다운로드 완료' });
    } catch (e) {
      console.error("Combined download error:", e);
      toast({ variant: 'destructive', title: '이미지 생성 실패' });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="w-full">
      {/* Wide Hero Section */}
      <section className="w-full bg-[#f1f4f9] border-b-2 border-slate-200 py-16 mb-12">
          <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 text-indigo-700 text-[10px] font-black mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest animate-in slide-in-from-top-4 duration-500">
                    <AppWindow className="h-3.5 w-3.5" /> High-End Design Studio
                </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                  AI <span className="text-indigo-600">프리미엄 상세페이지</span> 스튜디오
              </h1>
              <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                  <span className="text-slate-900">860px 고정 폭</span>으로 최적화된 무신사 매거진 스타일 레이아웃을 제공합니다. <br />
                  AI가 기획한 카피라이팅에 맞춰 <span className="text-indigo-600">개별 이미지 빌딩</span>을 통해 완벽한 상세페이지를 완성하세요.
              </p>
          </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">기본 설정</CardTitle>
                        <Button variant="outline" size="sm" className="text-xs gap-1 border-2 border-slate-900 font-bold hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onClick={handleAiRecommend} disabled={generationState === 'generating'}>
                            <Sparkles className="h-3 w-3" /> AI 추천
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label className="font-bold text-slate-700">상품 정보</Label>
                    <Textarea
                        placeholder="제품명, 소재, 특징 등을 자유롭게 적어주세요."
                        value={productInfo}
                        onChange={(e) => setProductInfo(e.target.value)}
                        className="h-32 resize-none border-2 border-slate-200 focus:border-slate-900"
                        disabled={generationState === 'generating'}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label className="font-bold text-slate-700">브랜드 지향점 (선택)</Label>
                    <Textarea
                        placeholder="예: 29CM 스타일, 세련된, 전문적인 톤"
                        value={strategy}
                        onChange={(e) => setStrategy(e.target.value)}
                        className="h-20 resize-none border-2 border-slate-200 focus:border-slate-900"
                        disabled={generationState === 'generating'}
                    />
                    </div>
                    
                    <div className="space-y-3">
                    <Label className="font-bold text-slate-700">템플릿 선택</Label>
                    <div className="grid gap-2">
                        {TEMPLATES.map((t) => (
                        <div 
                            key={t.id}
                            onClick={() => generationState !== 'generating' && setSelectedTemplate(t)}
                            className={cn(
                            "relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-slate-50",
                            selectedTemplate.id === t.id ? "border-slate-900 bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "border-slate-200 bg-white"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm text-slate-900">{t.name}</span>
                            {t.badge && <Badge className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 border-2 border-slate-900">{t.badge}</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">{t.description}</p>
                            {selectedTemplate.id === t.id && <CheckCircle2 className="absolute -top-2 -right-2 h-5 w-5 text-indigo-600 fill-white" />}
                        </div>
                        ))}
                    </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={startGeneration} className="w-full h-12 text-base font-black bg-indigo-600 hover:bg-indigo-700 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" disabled={generationState === 'generating'}>
                    {generationState === 'generating' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                    {generationState === 'completed' ? "다시 생성하기" : "상세페이지 생성 시작"}
                    </Button>
                </CardFooter>
                </Card>
            </div>

            <div className="lg:col-span-8">
            <Card className="min-h-[700px] flex flex-col border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                <div className="border-b-2 border-slate-900 bg-white p-4 flex justify-between items-center sticky top-0 z-20">
                <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter">AI Preview</h3>
                    <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" /> 860px 최적화 · 이미지 개별 생성 지원
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="border-2 border-slate-900 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onClick={handleSavePage} disabled={generationState !== 'completed' || isSaving || !user}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="border-2 border-slate-900 font-bold">저장하기</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                </div>

                <CardContent className="flex-1 bg-slate-100 p-0 overflow-y-auto">
                {generationState === 'generating' && (
                    <div className="h-[600px] flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin mb-4 text-indigo-600" />
                        <p className="font-black text-slate-900 text-lg">프리미엄 콘텐츠 구성 중...</p>
                        <p className="text-xs text-slate-500 font-bold mt-2">AI가 카피라이팅과 구조 설계를 진행하고 있습니다.</p>
                    </div>
                )}

                {generationState === 'idle' ? (
                    <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                    <div className="w-24 h-24 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
                        <ImageIcon className="h-10 w-10 opacity-30" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2 uppercase">프리미엄 상세페이지 빌더</h4>
                    <p className="text-sm max-w-xs font-medium">좌측 정보를 입력하면 860px 가로폭에 최적화된 매거진 스타일 디자인이 생성됩니다.</p>
                    </div>
                ) : content && (
                    <div className="p-10">
                    <div className="mx-auto space-y-8" style={{ width: '860px' }}>
                        {selectedTemplate.sections.includes(1) && (
                        <div className="relative group">
                            <div className="absolute -left-12 top-0 text-[10px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors">01</div>
                            <PageWrapper pageNum={1} pageTotal={selectedTemplate.pages}>
                            <Page1Hero 
                                data={content.page1} 
                                productName={content.productName} 
                                productNameEn={content.productNameEn} 
                                season={content.season} 
                                editable={true}
                                onGenerateImage={handleGenerateImage}
                                isGenerating={imageGeneratingPath === 'page1.heroImageUrl'}
                            />
                            </PageWrapper>
                        </div>
                        )}
                        {selectedTemplate.sections.includes(2) && (
                        <div className="relative group">
                            <div className="absolute -left-12 top-0 text-[10px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors">02</div>
                            <PageWrapper pageNum={2} pageTotal={selectedTemplate.pages}>
                            <Page2Problem data={content.page2} />
                            </PageWrapper>
                        </div>
                        )}
                        {selectedTemplate.sections.includes(4) && (
                        <div className="relative group">
                            <div className="absolute -left-12 top-0 text-[10px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors">03</div>
                            <PageWrapper pageNum={3} pageTotal={selectedTemplate.pages}>
                            <Page4Detail 
                                data={content.page4} 
                                productName={content.productName}
                                editable={true}
                                onGenerateImage={handleGenerateImage}
                                isGenerating={imageGeneratingPath}
                            />
                            </PageWrapper>
                        </div>
                        )}
                        {selectedTemplate.sections.includes(8) && (
                        <div className="relative group">
                            <div className="absolute -left-12 top-0 text-[10px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors">04</div>
                            <PageWrapper pageNum={4} pageTotal={selectedTemplate.pages}>
                            <Page8CTA data={content.page8} productName={content.productName} />
                            </PageWrapper>
                        </div>
                        )}
                    </div>
                    </div>
                )}
                </CardContent>

                {generationState === 'completed' && (
                <div className="border-t-2 border-slate-900 bg-white p-4 sticky bottom-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
                    <div className="flex flex-wrap gap-3 justify-between items-center max-w-5xl mx-auto">
                    <div className="flex gap-1.5 flex-wrap">
                        {Array.from({ length: selectedTemplate.pages }, (_, i) => (
                        <Button
                            key={i}
                            size="sm"
                            variant="outline"
                            className="h-8 text-[10px] px-2 border-2 border-slate-900 font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50"
                            onClick={() => handleSingleDownload(i + 1)}
                            disabled={downloading === `page-${i + 1}`}
                        >
                            {downloading === `page-${i + 1}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
                            {i + 1}P
                        </Button>
                        ))}
                    </div>
                    
                    <div className="flex gap-2">
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCombinedDownload}
                        disabled={!!downloading}
                        className="text-xs h-9 border-2 border-slate-900 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50"
                        >
                        <ImageIcon className="h-3.5 w-3.5 mr-2" />
                        합본 PNG
                        </Button>
                        <Button
                        size="sm"
                        onClick={handleZipDownload}
                        disabled={!!downloading}
                        className="bg-violet-600 hover:bg-violet-700 text-xs h-9 font-black border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                        {downloading === 'zip' ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <FileArchive className="h-3.5 w-3.5 mr-2" />}
                        전체 ZIP 다운로드
                        </Button>
                    </div>
                    </div>
                    <div className="mt-3 text-[10px] text-slate-500 font-bold flex items-center justify-center gap-2">
                    <div className="flex items-center gap-1"><Info className="h-3 w-3" /> 이미지를 생성한 뒤 저장하면 엑박 현상이 완벽히 해결됩니다.</div>
                    </div>
                </div>
                )}
            </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
