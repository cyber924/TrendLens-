
"use client";

import * as React from "react";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { useParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MarkdownReport } from "@/components/reports/MarkdownReport";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type ProductDataReport = {
  id: string;
  originalData: string;
  report: string;
  createdAt: Timestamp;
  createdBy: string;
};

export default function ProductDataReportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = React.useState(true);
  const [report, setReport] = React.useState<ProductDataReport | null>(null);

  React.useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "product_data_reports", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setReport({ id: docSnap.id, ...docSnap.data() } as ProductDataReport);
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
              <h1 className="text-3xl font-bold tracking-tight font-headline">데이터 분석 리포트</h1>
              <p className="text-muted-foreground mt-1">생성일: {formatDate(report.createdAt)}</p>
           </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
              <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">원본 데이터 (CSV)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea value={report.originalData} readOnly className="h-48 font-mono bg-secondary/50" />
                  </CardContent>
              </Card>
              
              <Separator />

              <div>
                  <h3 className="text-xl font-semibold mb-4">AI 생성 분석 리포트</h3>
                  <MarkdownReport content={report.report} />
              </div>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
