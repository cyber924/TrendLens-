"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";

export default function RecommendationsRedirectPage() {
  return (
    <div className="container mx-auto py-24 px-4 md:px-6 flex items-center justify-center">
      <div className="max-w-lg text-center">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>페이지 이전 안내</AlertTitle>
          <AlertDescription>
            더 강력해진 'AI 제품 기획실' 페이지로 통합되었습니다. 이제 텍스트 분석뿐만 아니라 AI가 생성한 비주얼 컨셉 보드까지 함께 만나보실 수 있습니다.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
          <Link href="/ideas">
            새로운 AI 제품 기획실로 이동
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
