
"use client";

import * as React from "react";
import { doc, onSnapshot, Timestamp, DocumentData } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { useParams, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { Loader2, ArrowLeft, Pencil, ShoppingBag, Tag, Palette, Download, ImageIcon, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Premium & Builder Page Components
import { PageWrapper } from '@/components/detail-pages/PageWrapper';
import { Page1Hero } from '@/components/detail-pages/Page1Hero';
import { Page2Problem } from '@/components/detail-pages/Page2Problem';
import { Page4Detail } from '@/components/detail-pages/Page4Detail';
import { Page8CTA } from '@/components/detail-pages/Page8CTA';
import { FashionBuilderLayout } from '@/components/builder-pages/FashionBuilderLayout';
import { FoodBuilderLayout } from '@/components/builder-pages/FoodBuilderLayout';
import { BeautyBuilderLayout } from '@/components/builder-pages/BeautyBuilderLayout';
import { LivingBuilderLayout } from '@/components/builder-pages/LivingBuilderLayout';
import type { DetailPageContent } from '@/lib/detail-page/schema';
import { downloadCombinedImage } from '@/lib/page-export';

// --- Trend Report Specific Types and Component ---
type TrendItem = {
  item: string;
  description: string;
  productIdea: string;
};

type TrendReportFullResult = {
  topKeywords: TrendItem[];
  topMaterials: TrendItem[];
  topColors: TrendItem[];
};

const TrendReportDetail = ({ data }: { data: TrendReportFullResult }) => {
  if (!data) return <p className="text-xs text-slate-400 font-medium">리포트 데이터가 없습니다.</p>;

  return (
     <div className="space-y-8">
      <div>
        <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-tighter">
            <Tag className="h-4 w-4 text-indigo-600" /> 상위 키워드
        </h4>
        <Accordion type="single" collapsible className="w-full space-y-3">
          {data.topKeywords?.map((item, index) => (
            <AccordionItem value={`kw-${index}`} key={index} className="border-2 border-slate-900 rounded-xl px-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AccordionTrigger className="text-sm font-bold py-3 hover:no-underline">{item.item}</AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                 <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{item.description}</p>
                 <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex gap-2">
                    <ShoppingBag className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <p className="text-[11px] font-bold text-slate-800"><span className="text-indigo-600 mr-1">IDEA:</span> {item.productIdea}</p>
                 </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      <div>
        <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-tighter">
            <Tag className="h-4 w-4 text-amber-500" /> 상위 소재
        </h4>
         <Accordion type="single" collapsible className="w-full space-y-3">
          {data.topMaterials?.map((item, index) => (
             <AccordionItem value={`mat-${index}`} key={index} className="border-2 border-slate-900 rounded-xl px-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AccordionTrigger className="text-sm font-bold py-3 hover:no-underline">{item.item}</AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                 <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{item.description}</p>
                 <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-2">
                    <ShoppingBag className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <p className="text-[11px] font-bold text-slate-800"><span className="text-amber-600 mr-1">IDEA:</span> {item.productIdea}</p>
                 </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

       <div>
        <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-tighter">
            <Palette className="h-4 w-4 text-rose-500" /> 상위 색상
        </h4>
         <Accordion type="single" collapsible className="w-full space-y-3">
          {data.topColors?.map((item, index) => (
             <AccordionItem value={`col-${index}`} key={index} className="border-2 border-slate-900 rounded-xl px-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AccordionTrigger className="text-sm font-bold py-3 hover:no-underline">{item.item}</AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                 <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{item.description}</p>
                 <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex gap-2">
                    <ShoppingBag className="h-4 w-4 text-rose-600 flex-shrink-0" />
                    <p className="text-[11px] font-bold text-slate-800"><span className="text-rose-600 mr-1">IDEA:</span> {item.productIdea}</p>
                 </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};


// --- Generic Document Types and Component ---
type ReportDocument = {
  id: string;
  query: string;
  report: string; // Can be Markdown or HTML
  isMarkdown: boolean;
  createdAt: Timestamp;
  createdBy: string;
  fullResult?: TrendReportFullResult; 
  content?: DetailPageContent; // Added for Premium Structured Pages
  template?: string;
  [key: string]: any;
};

const sanitizeConf = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'div', 'span', 'section', 'article', 'aside', 'header', 'footer']),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['class', 'style', 'data-*'],
        a: ["href", "name", "target"],
        img: ["src", "srcset", "alt", "title", "width", "height", "loading", "class", "style", "crossorigin"],
    },
     allowedStyles: {
        '*': {
            'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/],
            'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/],
            'text-align': [/^left$/, /^right$/, /^center$/],
            'max-width': [/^100%$/, /^\d+(px|rem|em|%)$/],
            'border-radius': [/^\d+(px|rem|em|%)$/],
            'margin': [/^auto$/, /^-^\d+(px|rem|em|%)$/],
            'padding': [/^\d+(px|rem|em|%)$/],
            'display': [/^flex$/, /^grid$/, /^block$/, /^inline-block$/, /^none$/],
            'flex-direction': [/^row$/, /^column$/],
            'justify-content': [/^center$/, /^space-between$/, /^space-around$/, /^flex-start$/, /^flex-end$/],
            'align-items': [/^center$/, /^flex-start$/, /^flex-end$/, /^stretch$/],
            'gap': [/^\d+(px|rem|em|%)$/],
        }
    },
    allowedSchemes: ['data', 'http', 'https'],
};


export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = React.useState(true);
  const [document, setDocument] = React.useState<ReportDocument | null>(null);
  const [downloading, setDownloading] = React.useState(false);
  const premiumContainerRef = React.useRef<HTMLDivElement>(null);
  
  const docCollectionPath = React.useMemo(() => {
    if (!id) return null;
    const typeParts = id.split('_');
    return typeParts.slice(0, -1).join('_');
  }, [id]);
  
  const docId = React.useMemo(() => id?.split('_').pop(), [id]);

  React.useEffect(() => {
    if (!docId || !docCollectionPath) {
        if (!authLoading && !loading && id) {
             toast({ variant: "destructive", title: "오류", description: "잘못된 문서 경로입니다." });
             setLoading(false);
        }
        return;
    }

    const docRef = doc(db, docCollectionPath, docId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DocumentData;
        
        let finalHtmlContent = '';
        let isMarkdown = false;

        if (docCollectionPath === 'trend_reports') {
            // Trend reports use fullResult
        } else if (data.content) {
            // Premium Structured Page
        } else {
            const reportContent = data.report || data.htmlContent || "";
            isMarkdown = !reportContent.trim().startsWith('<') && !reportContent.includes('</');
            finalHtmlContent = isMarkdown 
                ? sanitizeHtml(marked.parse(reportContent, { async: false }) as string, sanitizeConf)
                : sanitizeHtml(reportContent, sanitizeConf);
        }

        const mappedDoc: ReportDocument = {
          id: docSnap.id,
          query: data.query || data.title || data.productName || data.productInfo || data.keyword || "제목 없음",
          report: finalHtmlContent,
          isMarkdown: isMarkdown,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          fullResult: data.fullResult,
          content: data.content,
          platform: data.platform,
          category: data.category,
          timeframe: data.timeframe,
          template: data.template
        };
        setDocument(mappedDoc);

      } else {
        toast({ variant: "destructive", title: "오류", description: "해당 문서를 찾을 수 없습니다." });
      }
      setLoading(false);
    }, (error) => {
        console.error("Snapshot error", error);
        toast({ variant: "destructive", title: "데이터 로딩 오류", description: "문서를 불러오는 중 문제가 발생했습니다."});
        setLoading(false);
    });
    return () => unsubscribe();
  }, [docId, docCollectionPath, toast, id, loading, authLoading]);

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '날짜 정보 없음';
    return timestamp.toDate().toLocaleString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };
  
  const handleEditClick = () => {
    router.push(`/edit/${id}`);
  };

  const handleDownloadHtml = () => {
    if (!document) return;
    
    let htmlToDownload = "";

    if (document.content) {
        const renderedHtml = premiumContainerRef.current?.innerHTML || "";

        htmlToDownload = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${document.query}</title>
    <style>
        :root {
            --dp-bg: #fafaf7;
            --dp-paper: #ffffff;
            --dp-ink: #0a0a0a;
            --dp-ink-muted: #5a5a5a;
            --dp-line: #e5e5e5;
            --dp-accent: #e63946;
            --dp-beige: #f5ede0;
            --dp-black: #0a0a0a;
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap');
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        body { margin: 0; padding: 40px 0; background-color: #f1f5f9; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
        .detail-page-container { width: 860px; background-color: var(--dp-bg); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); margin-bottom: 32px; position: relative; overflow: hidden; }
        * { box-sizing: border-box; }
    </style>
</head>
<body>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 32px;">
      ${renderedHtml}
    </div>
</body>
</html>`;
    } else {
        htmlToDownload = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.query}</title>
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: { DEFAULT: '#a78bfa', foreground: '#ffffff' },
            secondary: { DEFAULT: '#f1f5f9', foreground: '#1e293b' },
            accent: { DEFAULT: '#60a5fa', foreground: '#ffffff' },
            background: '#ffffff',
            foreground: '#0f172a',
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&display=swap');
    body { font-family: 'Noto Sans KR', sans-serif; }
  </style>
</head>
<body class="bg-white text-slate-900 antialiased">
  <main class="max-w-4xl mx-auto p-4 sm:p-8">
    <div class="prose prose-slate prose-lg max-w-none">
        ${document.report}
    </div>
  </main>
</body>
</html>`;
    }
    
    const blob = new Blob([htmlToDownload], { type: 'text/html;charset=utf-8;' });
    const link = window.document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    const fileName = `${document.query.replace(/[^a-z0-9가-힣]/gi, '_')}.html`;
    link.setAttribute('download', fileName);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    toast({ title: "HTML 다운로드 완료" });
  };

  const handleImageDownload = async () => {
    if (!document || !document.content) return;
    setDownloading(true);
    try {
        const is4P = document.template?.includes('4페이지') || document.template?.includes('스탠다드');
        await downloadCombinedImage(is4P ? 4 : 1, document.query);
        toast({ title: "합본 이미지 다운로드 완료" });
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: '다운로드 실패', description: '이미지 캡처 중 오류가 발생했습니다.' });
    } finally {
        setDownloading(false);
    }
  };

  if (loading || authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }
  
  if (!document || (document && user && document.createdBy !== user.uid)) {
     return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-bold">접근 권한 없음</h1>
        <p className="text-muted-foreground mt-2">이 문서를 볼 권한이 없습니다.</p>
        <Button asChild className="mt-4 border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Link href="/dashboard/my-documents"><ArrowLeft className="mr-2 h-4 w-4" /> 내 문서로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  const isTrendReport = docCollectionPath === 'trend_reports';
  const isPremiumPage = docCollectionPath === 'structured_pages' && document.content;
  const is4P = document.template?.includes('4페이지') || document.template?.includes('스탠다드');
  const isBuilder = document.template?.startsWith('빌더');

  const renderBuilderLayout = () => {
      if (!document.content) return null;
      const props = { data: document.content };
      const temp = document.template?.toUpperCase() || "";
      if (temp.includes('FOOD')) return <FoodBuilderLayout {...props} />;
      if (temp.includes('BEAUTY')) return <BeautyBuilderLayout {...props} />;
      if (temp.includes('LIVING')) return <LivingBuilderLayout {...props} />;
      return <FashionBuilderLayout {...props} />;
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
        <div className="mb-6 flex justify-between items-center">
            <Button variant="outline" size="sm" asChild className="border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50">
                <Link href="/dashboard/my-documents">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    내 문서함
                </Link>
            </Button>
            <div className="flex gap-2">
                {!isTrendReport && (
                    <Button variant="outline" size="sm" onClick={handleDownloadHtml} className="border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 h-9">
                        <Download className="mr-2 h-4 w-4" /> HTML
                    </Button>
                )}
                {isPremiumPage && (
                    <Button variant="outline" size="sm" onClick={handleImageDownload} disabled={downloading} className="border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 h-9">
                        {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />} 이미지
                    </Button>
                )}
                <Button size="sm" onClick={handleEditClick} className="bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-9">
                    <Pencil className="mr-2 h-4 w-4" /> 편집
                </Button>
            </div>
        </div>
        
       <Card className={isPremiumPage ? "bg-slate-100 border-none shadow-none" : "border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"}>
        {!isPremiumPage && (
            <CardHeader className="border-b-2 border-slate-900 bg-slate-50 rounded-t-lg space-y-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-slate-900 text-white text-[10px] px-2 py-0 border-none font-black uppercase tracking-widest">
                            {docCollectionPath?.replace('_', ' ')}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {formatDate(document.createdAt)}
                        </span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                        {document.query}
                    </h1>
                </div>
            </CardHeader>
        )}

        <CardContent className={isPremiumPage ? "p-0" : "p-6 md:p-10 bg-white"}>
            {isTrendReport ? (
              <div className="space-y-8">
                <div className="bg-slate-50 border-2 border-slate-900 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">플랫폼</p>
                        <p className="text-xs font-black text-slate-900">{document.platform}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">카테고리</p>
                        <p className="text-xs font-black text-slate-900">{document.category}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">분석 기간</p>
                        <p className="text-xs font-black text-slate-900">{document.timeframe}</p>
                    </div>
                </div>
                <Separator className="bg-slate-100" />
                <TrendReportDetail data={document.fullResult!} />
              </div>
            ) : isPremiumPage ? (
                <div ref={premiumContainerRef} className="mx-auto space-y-12" style={{ width: '860px' }}>
                    {isBuilder ? (
                        <PageWrapper pageNum={1} pageTotal={1}>
                            {renderBuilderLayout()}
                        </PageWrapper>
                    ) : (
                        <>
                            <PageWrapper pageNum={1} pageTotal={is4P ? 4 : 1}>
                                <Page1Hero data={document.content!.page1} productName={document.content!.productName} productNameEn={document.content!.productNameEn} season={document.content!.season} />
                            </PageWrapper>
                            {is4P && (
                                <>
                                    <PageWrapper pageNum={2} pageTotal={4}>
                                        <Page2Problem data={document.content!.page2} />
                                    </PageWrapper>
                                    <PageWrapper pageNum={3} pageTotal={4}>
                                        <Page4Detail data={document.content!.page4} productName={document.content!.productName} />
                                    </PageWrapper>
                                    <PageWrapper pageNum={4} pageTotal={4}>
                                        <Page8CTA data={document.content!.page8} productName={document.content!.productName} />
                                    </PageWrapper>
                                </>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <div 
                    className="prose prose-sm md:prose-base max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight prose-p:font-medium prose-p:text-slate-600 prose-p:leading-relaxed prose-img:rounded-xl prose-img:border-2 prose-img:border-slate-900 prose-strong:text-indigo-600 prose-strong:font-black animate-in fade-in-50" 
                    dangerouslySetInnerHTML={{ __html: document.report }} 
                />
            )}
        </CardContent>
       </Card>
    </div>
  );
}
