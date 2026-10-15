
"use client";

import * as React from "react";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { useParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { Loader2, ArrowLeft, ShoppingBag, Tag, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

type TrendItem = {
  item: string;
  description: string;
  productIdea: string;
};

type TrendReport = {
  id: string;
  title: string;
  category: string;
  platform: string;
  timeframe: string;
  fullResult: {
    topKeywords: TrendItem[];
    topMaterials: TrendItem[];
    topColors: TrendItem[];
  };
  createdAt: Timestamp;
  createdBy: string;
};

export default function TrendReportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = React.useState(true);
  const [report, setReport] = React.useState<TrendReport | null>(null);

  React.useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "trend_reports", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setReport({ id: docSnap.id, ...docSnap.data() } as TrendReport);
      } else {
        toast({ variant: "destructive", title: "오류", description: "해당 리포트를 찾을 수 없습니다." });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, toast]);

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '날짜 정보 없음';
    return timestamp.toDate().toLocaleString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading || authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }
  
  if (!report || (report && user && report.createdBy !== user.uid)) {
     return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-bold">접근 권한 없음</h1>
        <p className="text-muted-foreground mt-2">이 문서를 볼 권한이 없습니다.</p>
        <Button asChild className="mt-4">
            <Link href="/dashboard/my-documents"><ArrowLeft className="mr-2 h-4 w-4" /> 내 문서로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
        <div className="mb-4">
            <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/my-documents">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    내 문서로 돌아가기
                </Link>
            </Button>
        </div>
        
       <Card>
        <CardHeader>
           <div>
              <h1 className="text-3xl font-bold tracking-tight font-headline">{report.title}</h1>
              <p className="text-muted-foreground mt-1">생성일: {formatDate(report.createdAt)}</p>
           </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
              <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">분석 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm grid grid-cols-2 gap-2">
                      <p><strong className="font-semibold">플랫폼:</strong> {report.platform}</p>
                      <p><strong className="font-semibold">카테고리:</strong> {report.category}</p>
                      <p><strong className="font-semibold">기간:</strong> {report.timeframe}</p>
                  </CardContent>
              </Card>
              
              <Separator />
              
              <h3 className="text-xl font-semibold">AI 트렌드 분석 결과</h3>

              {report.fullResult && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3">상위 키워드</h4>
                    <Accordion type="single" collapsible className="w-full">
                      {report.fullResult.topKeywords.map((item, index) => (
                        <AccordionItem value={`kw-${index}`} key={index}>
                          <AccordionTrigger className="text-base">{item.item}</AccordionTrigger>
                          <AccordionContent className="space-y-4 px-2">
                             <p className="text-muted-foreground"><Tag className="inline-block h-4 w-4 mr-2" />{item.description}</p>
                             <p className="text-primary-foreground bg-primary/80 p-3 rounded-md"><ShoppingBag className="inline-block h-4 w-4 mr-2" /><strong>아이디어:</strong> {item.productIdea}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3">상위 소재</h4>
                     <Accordion type="single" collapsible className="w-full">
                      {report.fullResult.topMaterials.map((item, index) => (
                         <AccordionItem value={`mat-${index}`} key={index}>
                          <AccordionTrigger className="text-base">{item.item}</AccordionTrigger>
                          <AccordionContent className="space-y-4 px-2">
                             <p className="text-muted-foreground"><Tag className="inline-block h-4 w-4 mr-2" />{item.description}</p>
                             <p className="text-primary-foreground bg-primary/80 p-3 rounded-md"><ShoppingBag className="inline-block h-4 w-4 mr-2" /><strong>아이디어:</strong> {item.productIdea}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                   <div>
                    <h4 className="text-lg font-semibold mb-3">상위 색상</h4>
                     <Accordion type="single" collapsible className="w-full">
                      {report.fullResult.topColors.map((item, index) => (
                         <AccordionItem value={`col-${index}`} key={index}>
                          <AccordionTrigger className="text-base">{item.item}</AccordionTrigger>
                          <AccordionContent className="space-y-4 px-2">
                             <p className="text-muted-foreground"><Palette className="inline-block h-4 w-4 mr-2" />{item.description}</p>
                             <p className="text-primary-foreground bg-primary/80 p-3 rounded-md"><ShoppingBag className="inline-block h-4 w-4 mr-2" /><strong>아이디어:</strong> {item.productIdea}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              )}
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
