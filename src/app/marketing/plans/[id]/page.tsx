
"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function MarketingPlanDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      // Prepend a type identifier for the unified page
      router.replace(`/insights/marketing_plans_${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>리포트 페이지로 이동 중...</p>
    </div>
  );
}

    