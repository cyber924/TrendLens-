"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IdeasRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ideas/new');
  }, [router]);

  return null; // or a loading spinner
}
