
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/client';
import * as React from 'react';
import { collection, query, onSnapshot, Timestamp, where } from 'firebase/firestore';
import { Loader2, Lightbulb, TrendingUp, Users, BotMessageSquare, AppWindow, FileText, ArrowRight, FolderArchive, ImageIcon, ChevronRight, Sparkles, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const AutoChartCard = dynamic(() => import('@/components/charts/auto-chart').then(mod => mod.AutoChartCard), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px]" />,
});


type AnyDocument = {
  id: string;
  type: string;
  category?: string;
  productName?: string;
  createdBy: string;
  createdAt: Timestamp;
  [key: string]: any; // To accommodate other fields
};

const recommendationTopics = [
  {
    title: "최신 패션 트렌드 분석하기",
    description: "AI를 사용해 현재 가장 인기 있는 스타일과 아이템을 파악하세요.",
    href: "/trends/live-analysis",
    icon: <TrendingUp className="w-6 h-6 text-indigo-500" />,
  },
  {
    title: "새로운 고객 페르소나 정의하기",
    description: "타겟 고객을 설정하고 그들을 위한 맞춤형 상품을 기획해보세요.",
    href: "/persona",
    icon: <Users className="w-6 h-6 text-indigo-500" />,
  },
   {
    title: "상품명 일괄 리뉴얼하기",
    description: "기존 상품명에 새로운 컨셉을 적용하여 매력도를 높여보세요.",
    href: "/ideas/batch-rename",
    icon: <BotMessageSquare className="w-6 h-6 text-indigo-500" />,
  },
   {
    title: "상세 페이지 자동 생성하기",
    description: "상품 정보만으로 전문가 수준의 상세 페이지를 즉시 제작하세요.",
    href: "/details/studio",
    icon: <AppWindow className="w-6 h-6 text-indigo-500" />,
  },
];

const QuickNav = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all bg-indigo-600 text-white overflow-hidden group">
            <Link href="/dashboard/my-documents" className="flex items-center justify-between p-6 h-full">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                        <FolderArchive className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">내 문서함 바로가기</h3>
                        <p className="text-indigo-100 text-[10px] opacity-80 font-medium">저장된 분석 리포트와 상세페이지 관리</p>
                    </div>
                </div>
                <ChevronRight className="w-6 h-6 opacity-50 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
            </Link>
        </Card>
        <Card className="border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all bg-white overflow-hidden group">
            <Link href="/admin/images" className="flex items-center justify-between p-6 h-full text-slate-900">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">이미지 갤러리 관리</h3>
                        <p className="text-slate-500 text-[10px] opacity-80 font-medium">AI 생성 이미지와 업로드 파일 관리</p>
                    </div>
                </div>
                <ChevronRight className="w-6 h-6 opacity-30 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
            </Link>
        </Card>
    </div>
);


const AIRecommendations = () => (
    <Card className="lg:col-span-3 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
        <CardHeader>
            <CardTitle className="flex items-center text-xl font-black">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                AI 추천 작업
            </CardTitle>
            <CardDescription className="text-[11px] font-medium">비즈니스 성장을 위해 지금 바로 실행 가능한 작업을 제안합니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendationTopics.map(topic => (
                 <Card key={topic.title} className="border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-white group">
                    <CardHeader className="pb-3">
                        <div className="group-hover:scale-110 transition-transform">{topic.icon}</div>
                        <CardTitle className="text-sm font-bold pt-2">{topic.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{topic.description}</p>
                    </CardContent>
                    <CardFooter>
                         <Button variant="outline" size="sm" asChild className="w-full border-2 border-slate-900 hover:bg-slate-50 transition-colors font-bold text-xs h-8">
                            <Link href={topic.href}>
                                시작하기
                                <ArrowRight className="w-3 h-3 ml-1.5" />
                            </Link>
                         </Button>
                    </CardFooter>
                 </Card>
            ))}
        </CardContent>
    </Card>
)

const documentTypes = [
    { name: "마케팅 플랜", collectionName: "marketing_plans" },
    { name: "트렌드 리포트", collectionName: "trend_reports" },
    { name: "인사이트 리포트", collectionName: "insight_reports" },
    { name: "페르소나 리포트", collectionName: "persona_reports" },
    { name: "자동 리포트", collectionName: "product_data_reports" },
    { name: "상세 페이지", collectionName: "structured_pages" },
    { name: "자동 기획안", collectionName: "automated_plans" },
];

export default function DashboardPage() {
    const [user, authLoading] = useAuthState(auth);
    const { toast } = useToast();
    const [documents, setDocuments] = React.useState<AnyDocument[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (!user && !authLoading) {
            setIsLoading(false);
            return;
        }
        if (!user) return;

        setIsLoading(true);
        let active = true;

        const unsubscribes = documentTypes.map(({ collectionName, name }) => {
          const q = query(
              collection(db, collectionName), 
              where("createdBy", "==", user.uid)
          );
          
          return onSnapshot(q, (snapshot) => {
            if (!active) return;
            
            const newDocs = snapshot.docs.map(d => ({ ...d.data(), id: d.id, type: collectionName } as AnyDocument));
            
            setDocuments(prevDocs => {
              const otherDocs = prevDocs.filter(d => d.type !== collectionName);
              const updatedDocs = [...otherDocs, ...newDocs];
              updatedDocs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
              return updatedDocs;
            });
    
            setIsLoading(false);
          }, (error) => {
            if (!active) return;
            console.error(`Error fetching ${collectionName}: `, error);
            toast({
              variant: "destructive",
              title: "데이터 로딩 실패",
              description: `${name} 문서를 불러오는 중 오류가 발생했습니다.`,
            });
            setIsLoading(false);
          });
        });

        return () => {
            active = false;
            unsubscribes.forEach(unsub => unsub());
        };
    }, [user, authLoading, toast]);


    const docTypeDistribution = React.useMemo(() => {
        const counts = documents.reduce((acc, doc) => {
            const typeInfo = documentTypes.find(t => t.collectionName === doc.type);
            const name = typeInfo?.name || doc.type;
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [documents]);
    
    const categoryDistribution = React.useMemo(() => {
        const trendReports = documents.filter(doc => doc.type === 'trend_reports' && doc.category);
        const counts = trendReports.reduce((acc, doc) => {
            const category = doc.category!;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5) // Top 5
            .map(([name, value]) => ({ name, value }));

    }, [documents]);


    if (authLoading || isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (!user) {
        return (
            <div className="container mx-auto py-12 px-4 md:px-6 text-center">
              <h1 className="text-2xl font-bold text-slate-900">접근 권한 없음</h1>
              <p className="text-muted-foreground mt-2">대시보드를 보려면 로그인이 필요합니다.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Wide Hero Section - Improved */}
            <section className="w-full bg-[#f1f4f9] border-b-2 border-slate-200 py-16 mb-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 text-indigo-700 text-[10px] font-black mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest animate-in slide-in-from-top-4 duration-500">
                        <Sparkles className="h-3.5 w-3.5" /> TrendLens AI Workspace
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                        나만의 <span className="text-indigo-600">AI 대시보드</span>
                    </h1>
                    <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                        {user.email}님의 활동 데이터를 실시간으로 분석하여 <br />
                        비즈니스 인사이트와 생성된 모든 문서를 한눈에 관리합니다.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-6 pb-20">
                <QuickNav />

                <div className="grid gap-10 grid-cols-1 lg:grid-cols-3">
                    <AIRecommendations />
                    
                    {documents.length > 0 ? (
                        <>
                            <AutoChartCard
                                chartType="pie"
                                data={docTypeDistribution}
                                title="문서 종류별 분포"
                                description="내가 생성한 문서들의 종류를 파악합니다."
                                className="lg:col-span-1 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white"
                            />

                            <AutoChartCard
                                chartType="bar"
                                data={categoryDistribution}
                                title="나의 관심 카테고리 Top 5"
                                description="가장 자주 분석한 상품 카테고리 순위입니다."
                                className="lg:col-span-2 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white"
                            />
                        </>
                    ) : (
                        <div className="lg:col-span-3">
                            <Card className="text-center py-20 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                                <CardContent>
                                    <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                                    <h3 className="text-lg font-bold mt-4 text-slate-900 uppercase">데이터가 부족합니다</h3>
                                    <p className="text-xs text-muted-foreground mt-2 font-medium">
                                        다양한 AI 기능을 사용하여 첫 번째 리포트를 생성해 보세요.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
