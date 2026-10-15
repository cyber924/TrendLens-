
"use client";

import * as React from "react";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { useParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { Loader2, ArrowLeft, Download, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { toPng } from 'html-to-image';
import { HtmlPreview } from "@/components/details/HtmlPreview";

type StructuredPage = {
  id: string;
  productInfo: string;
  strategy: string;
  template: string;
  htmlContent: string;
  createdAt: Timestamp;
  createdBy: string;
};

export default function SavedDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = React.useState(true);
  const [pageData, setPageData] = React.useState<StructuredPage | null>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "structured_pages", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPageData({ id: docSnap.id, ...docSnap.data() } as StructuredPage);
      } else {
        toast({ variant: "destructive", title: "오류", description: "해당 페이지를 찾을 수 없습니다." });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, toast]);
  
  const handleDownloadHtml = () => {
    if (!pageData) return;
    const blob = new Blob([pageData.htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'product_page.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "HTML 다운로드 완료" });
  };
  
  const handleDownloadPng = React.useCallback(() => {
    if (!previewRef.current) return;
    toPng(previewRef.current, { cacheBust: true, pixelRatio: 1.5, skipFonts: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'product_page.png';
        link.href = dataUrl;
        link.click();
        toast({ title: "PNG 다운로드 완료" });
      })
      .catch((err) => {
        console.error(err);
        toast({ variant: "destructive", title: "PNG 변환 실패", description: "이미지를 생성하는 중 오류가 발생했습니다." });
      });
  }, [previewRef, toast]);


  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '날짜 정보 없음';
    return timestamp.toDate().toLocaleString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading || authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }
  
  if (!pageData || (pageData && user && pageData.createdBy !== user.uid)) {
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
           <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                  <h1 className="text-3xl font-bold tracking-tight font-headline">저장된 상세 페이지</h1>
                  <p className="text-muted-foreground mt-1">생성일: {formatDate(pageData.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownloadHtml} variant="outline"><Download className="mr-2 h-4 w-4" /> HTML</Button>
                <Button onClick={handleDownloadPng} variant="outline"><FileImage className="mr-2 h-4 w-4" /> PNG</Button>
              </div>
           </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">원본 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                      <p><strong className="font-semibold">상품정보:</strong> {pageData.productInfo}</p>
                      <p><strong className="font-semibold">전략:</strong> {pageData.strategy}</p>
                       <p><strong className="font-semibold">템플릿:</strong> {pageData.template}단계</p>
                  </CardContent>
              </Card>
              <div>
                  <h3 className="text-lg font-semibold mb-2">AI 생성 결과</h3>
                  <div ref={previewRef} className="border rounded-md p-4 bg-white">
                      <HtmlPreview htmlContent={pageData.htmlContent} />
                  </div>
              </div>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
