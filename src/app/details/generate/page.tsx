
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Download, Save, Sparkles, FileArchive, ImageIcon, LayoutTemplate, CheckCircle2 } from 'lucide-react';
import { generateDetailContent } from '@/ai/flows/generate-detail-content-flow';
import { generateProductImage } from '@/ai/flows/generate-product-image-flow';
import type { DetailPageContent } from '@/lib/detail-page/schema';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '@/lib/firebase/client';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';
import { downloadSinglePage, downloadCombinedImage } from '@/lib/page-export';
import { Badge } from "@/components/ui/badge";

import { BuilderPageWrapper } from '@/components/builder-pages/BuilderPageWrapper';
import { FashionBuilderLayout } from '@/components/builder-pages/FashionBuilderLayout';
import { FoodBuilderLayout } from '@/components/builder-pages/FoodBuilderLayout';
import { BeautyBuilderLayout } from '@/components/builder-pages/BeautyBuilderLayout';
import { LivingBuilderLayout } from '@/components/builder-pages/LivingBuilderLayout';

const CATEGORIES = [
  { id: 'fashion', name: '여성의류' },
  { id: 'food', name: '식품/신선식품' },
  { id: 'beauty', name: '화장품/뷰티' },
  { id: 'living', name: '생활가전/가구' },
];

const RECOMMENDATIONS: Record<string, any[]> = {
  fashion: [
    { productInfo: "제품명: 실크 블렌드 새틴 슬립 원피스\n특징: 은은한 광택감, 길이 조절 어깨끈, 드레이프가 아름다운 H라인", strategy: "고급 호텔 라운지나 파티에 어울리는 우아함을 강조해줘." },
    { productInfo: "제품명: 오버핏 프리미엄 코튼 셔츠\n특징: 고밀도 수입 원단, 탄탄한 조직감, 자연스러운 구김 방지", strategy: "출근룩부터 데일리룩까지 활용 가능한 '기본의 가치'를 보여줘." }
  ],
  food: [
    { productInfo: "제품명: 지리산 산골 유기농 벌꿀\n특징: 무설탕 천연 벌꿀, 탄소동위원소비 -23.5% 최상급, 휴대용 스틱형", strategy: "신선함과 자연의 건강함을 그대로 담은 선물용 이미지를 부각해줘." },
    { productInfo: "제품명: 저온 압착 수제 생들기름\n특징: 100% 국산 들깨, 발암물질 걱정 없는 저온 방식, 진한 풍미", strategy: "요리의 격을 높이는 '한 방울의 차이'를 기술적으로 설명해줘." }
  ],
  beauty: [
    { productInfo: "제품명: 비건 콜라겐 탄력 크림\n특징: 식물성 콜라겐 50,000ppm, 리포좀 공법 흡수력 극대화, 저자극 인증", strategy: "피부 속부터 차오르는 광채와 비건 브랜드의 윤리적 가치를 강조해줘." },
    { productInfo: "제품명: 시카 진정 수분 앰플\n특징: 병풀추출물 80%, 즉각적인 온도 감소, 끈적임 없는 산뜻한 제형", strategy: "민감해진 피부를 즉각적으로 잠재우는 '진정의 힘'을 깨끗한 톤으로 작성해줘." }
  ],
  living: [
    { productInfo: "제품명: 노이즈 캔슬링 무선 헤드폰\n특징: 40mm 다이내믹 드라이버, 50시간 재생, 멀티포인트 지원", strategy: "몰입감 넘치는 사운드와 세련된 디자인으로 완성되는 '나만의 공간'을 보여줘." },
    { productInfo: "제품명: 미니멀 무드 스탠드 조명\n특징: 3단계 밝기 조절, 눈부심 방지 필터, USB 충전식 무선", strategy: "공간의 분위기를 한 번에 바꾸는 '빛의 마법'을 감성적으로 기획해줘." }
  ]
};

export default function GenerateDetailsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('fashion');
  const [productInfo, setProductInfo] = useState('');
  const [strategy, setStrategy] = useState('');
  const [generationState, setGenerationState] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [content, setContent] = useState<DetailPageContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageGeneratingPath, setImageGeneratingPath] = useState<string | null>(null);
  
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const handleAiRecommend = () => {
    const pool = RECOMMENDATIONS[selectedCategory];
    const item = pool[Math.floor(Math.random() * pool.length)];
    setProductInfo(item.productInfo);
    setStrategy(item.strategy);
    toast({ title: "카테고리별 맞춤 데이터 입력 완료" });
  };

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
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    });
  };

  const startGeneration = async () => {
    if (!productInfo) {
      toast({ variant: "destructive", title: "정보 필요", description: "상품 정보를 입력해주세요." });
      return;
    }
    setGenerationState('generating');
    setContent(null);

    try {
        const result = await generateDetailContent({
            productInfo,
            strategy: strategy || '각 카테고리의 감성을 극대화하는 세련된 톤으로 작성해줘.',
        });
        setContent(result);
        setGenerationState('completed');
        toast({ title: "레이아웃 구성 완료" });
    } catch (error: any) {
        setGenerationState('error');
        toast({ variant: "destructive", title: "생성 실패", description: error.message });
    }
  };

  const handleGenerateImage = async (template: string, variables: Record<string, string>, path: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: '로그인 필요', description: '이미지 저장을 위해 로그인이 필요합니다.' });
      return;
    }

    setImageGeneratingPath(path);
    try {
      const base64Image = await generateProductImage({ template: template as any, variables });
      const compressedImage = await compressImage(base64Image);

      const fileName = `builder_${Date.now()}.jpg`;
      const storagePath = `builder_images/${user.uid}/${fileName}`;
      const storageRef = ref(storage, storagePath);
      await uploadString(storageRef, compressedImage, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'studio_images'), {
          userId: user.uid,
          downloadURL,
          storagePath,
          fileName,
          template: template,
          variables: variables,
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
      toast({ title: "이미지 생성 및 갤러리 저장 성공" });
    } catch (error: any) {
      toast({ variant: 'destructive', title: '이미지 실패', description: error.message });
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
            template: `빌더-${selectedCategory.toUpperCase()}`,
            content: sanitizedContent,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
        });
        toast({ title: '페이지가 안전하게 저장되었습니다.' });
    } catch (error) {
        console.error("Error saving page:", error);
        toast({ variant: 'destructive', title: '저장 실패' });
    } finally {
        setIsSaving(false);
    }
  };

  const renderLayout = () => {
    if (!content) return null;
    const props = {
        data: content,
        editable: true,
        onGenerateImage: handleGenerateImage,
        isGenerating: imageGeneratingPath
    };

    switch(selectedCategory) {
        case 'food': return <FoodBuilderLayout {...props} />;
        case 'beauty': return <BeautyBuilderLayout {...props} />;
        case 'living': return <LivingBuilderLayout {...props} />;
        default: return <FashionBuilderLayout {...props} />;
    }
  };

  return (
    <div className="w-full">
      {/* Wide Hero Section */}
      <section className="w-full bg-[#f1f4f9] border-b-2 border-slate-200 py-16 mb-12">
          <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 text-indigo-700 text-[10px] font-black mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest animate-in slide-in-from-top-4 duration-500">
                    <LayoutTemplate className="h-3.5 w-3.5" /> Vertical Content Builder
                </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                  AI <span className="text-indigo-600">상세 페이지</span> 빌더
              </h1>
              <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                  카테고리만 선택하세요. AI가 해당 상품군에 가장 <span className="text-slate-900">최적화된 1페이지 레이아웃</span>을 설계합니다. <br />
                  복잡한 설정 없이 전문가 수준의 상세페이지를 가장 빠르게 제작할 수 있는 도구입니다.
              </p>
          </div>
      </section>

      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">기본 설정</CardTitle>
                        <Button variant="outline" size="sm" className="text-xs border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onClick={handleAiRecommend} disabled={generationState === 'generating'}>
                            <Sparkles className="h-3 w-3 mr-1" /> AI 추천
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label className="font-bold text-slate-700">판매 카테고리</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={generationState === 'generating'}>
                        <SelectTrigger className="border-2 border-slate-200">
                        <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-slate-900">
                        {CATEGORIES.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>
                    <div className="space-y-2">
                    <Label className="font-bold text-slate-700">상품 정보</Label>
                    <Textarea
                        placeholder="제품명과 핵심 특징을 적어주세요."
                        value={productInfo}
                        onChange={(e) => setProductInfo(e.target.value)}
                        className="h-32 resize-none border-2 border-slate-200 focus:border-slate-900"
                        disabled={generationState === 'generating'}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label className="font-bold text-slate-700">전략 포인트 (선택)</Label>
                    <Textarea
                        placeholder="강조하고 싶은 소구점을 적어주세요."
                        value={strategy}
                        onChange={(e) => setStrategy(e.target.value)}
                        className="h-20 resize-none border-2 border-slate-200 focus:border-slate-900"
                        disabled={generationState === 'generating'}
                    />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={startGeneration} className="w-full h-12 text-base font-black bg-indigo-600 hover:bg-indigo-700 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" disabled={generationState === 'generating'}>
                    {generationState === 'generating' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                    페이지 빌드 시작
                    </Button>
                </CardFooter>
                </Card>
            </div>

            <div className="lg:col-span-8">
            <Card className="min-h-[700px] flex flex-col border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                <div className="border-b-2 border-slate-900 bg-white p-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-50 text-indigo-700 border-2 border-slate-900 font-black uppercase">{selectedCategory} LAYOUT</Badge>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" /> 860px 고정 
                    </span>
                </div>
                <Button variant="ghost" size="icon" className="border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onClick={handleSavePage} disabled={generationState !== 'completed' || isSaving || !user}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                </div>

                <CardContent className="flex-1 bg-slate-100 p-0 overflow-y-auto">
                {generationState === 'generating' && (
                    <div className="h-[600px] flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                        <p className="font-black text-slate-900">분야별 최적 레이아웃 설계 중...</p>
                    </div>
                )}

                {generationState === 'idle' ? (
                    <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                    <LayoutTemplate className="h-16 w-16 mb-4 opacity-20" />
                    <h4 className="text-xl font-black text-slate-900 mb-2 uppercase">카테고리 맞춤 빌더</h4>
                    <p className="text-sm max-w-xs font-medium">좌측에서 분야를 선택하면 해당 상품군에 최적화된 독립적인 레이아웃이 자동 생성됩니다.</p>
                    </div>
                ) : content && (
                    <div className="p-10">
                    <div className="mx-auto" style={{ width: '860px' }}>
                        <BuilderPageWrapper pageNum={1}>
                        {renderLayout()}
                        </BuilderPageWrapper>
                    </div>
                    </div>
                )}
                </CardContent>

                {generationState === 'completed' && (
                <div className="border-t-2 border-slate-900 bg-white p-4 sticky bottom-0 z-20 shadow-md">
                    <div className="flex justify-between items-center max-w-5xl mx-auto">
                    <div className="text-xs text-slate-500 font-bold">실제 이미지를 생성하여 페이지의 완성도를 높여보세요.</div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onClick={() => downloadSinglePage(1, content?.productName || 'builder')}>
                            <LayoutTemplate className="h-3.5 w-3.5 mr-2" /> HTML
                        </Button>
                        <Button size="sm" onClick={() => downloadCombinedImage(1, content?.productName || 'builder')} className="bg-violet-600 hover:bg-violet-700 text-white font-black border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <ImageIcon className="h-3.5 w-3.5 mr-2" /> 합본 PNG 다운로드
                        </Button>
                    </div>
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
