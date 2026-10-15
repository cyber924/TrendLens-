
"use client";

import * as React from "react";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { useParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { Loader2, ArrowLeft, Lightbulb, TrendingUp, BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GenerateAutomatedProductPlanOutput } from "@/ai/flows/generate-automated-plan-flow";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MarkdownReport } from "@/components/reports/MarkdownReport";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type AutomatedPlan = GenerateAutomatedProductPlanOutput & {
  id: string;
  keyword: string;
  createdAt: Timestamp;
  createdBy: string;
};

export default function AutomatedPlanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = React.useState(true);
  const [plan, setPlan] = React.useState<AutomatedPlan | null>(null);

  React.useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "automated_plans", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPlan({ id: docSnap.id, ...docSnap.data() } as AutomatedPlan);
      } else {
        toast({ variant: "destructive", title: "오류", description: "해당 기획안을 찾을 수 없습니다." });
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
  
  if (!plan || (plan && user && plan.createdBy !== user.uid)) {
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
              <h1 className="text-3xl font-bold tracking-tight font-headline">AI 자동 기획안: "{plan.keyword}"</h1>
              <p className="text-muted-foreground mt-1">생성일: {formatDate(plan.createdAt)}</p>
           </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={['trends', 'idea', 'marketing']} className="w-full space-y-4">
                
                <AccordionItem value="trends" className="border rounded-lg">
                <AccordionTrigger className="px-4 text-lg font-semibold"><TrendingUp className="mr-2 h-5 w-5 text-primary"/>1. 트렌드 분석</AccordionTrigger>
                <AccordionContent className="p-4 space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {plan.trendAnalysis.topKeywords.map(k => <Badge key={k.item}>{k.item}</Badge>)}
                        {plan.trendAnalysis.topColors.map(c => <Badge variant="secondary" key={c.item}>{c.item}</Badge>)}
                        {plan.trendAnalysis.topMaterials.map(m => <Badge variant="outline" key={m.item}>{m.item}</Badge>)}
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                    '{plan.trendAnalysis.topKeywords[0].item}' 키워드를 기반으로 상품 기획을 진행했습니다.
                    </p>
                </AccordionContent>
                </AccordionItem>

                <AccordionItem value="idea" className="border rounded-lg">
                <AccordionTrigger className="px-4 text-lg font-semibold"><Lightbulb className="mr-2 h-5 w-5 text-primary"/>2. 상품 아이디어</AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {plan.productIdea.images.slice(0,3).map((image, index) => (
                            <div key={index} className="relative aspect-square">
                            <Image 
                                src={image}
                                alt={`AI generated concept image ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover rounded-lg border"
                                data-ai-hint="fashion concept"
                            />
                            </div>
                        ))}
                    </div>
                    <MarkdownReport content={plan.productIdea.report} />
                </AccordionContent>
                </AccordionItem>

                <AccordionItem value="marketing" className="border rounded-lg">
                <AccordionTrigger className="px-4 text-lg font-semibold"><BotMessageSquare className="mr-2 h-5 w-5 text-primary"/>3. 마케팅 전략</AccordionTrigger>
                <AccordionContent className="p-4">
                    <MarkdownReport content={plan.marketingPlan.report} />
                </AccordionContent>
                </AccordionItem>

            </Accordion>
        </CardContent>
       </Card>
    </div>
  );
}
