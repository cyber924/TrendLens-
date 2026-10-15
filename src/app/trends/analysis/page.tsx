
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";

export default function SavedTrendsRedirectPage() {
  return (
    <div className="container mx-auto py-24 px-4 md:px-6 flex items-center justify-center">
      <div className="max-w-lg text-center">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>페이지 통합 안내</AlertTitle>
          <AlertDescription>
            이제 모든 종류의 저장된 문서는 '대시보드 &gt; 내 문서' 페이지에서 통합 관리됩니다. 더 편리하게 모든 결과물을 찾아보세요.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
          <Link href="/dashboard/my-documents">
            내 문서로 이동
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
