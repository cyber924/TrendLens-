"use client";

import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";

type MarkdownReportProps = {
  content: string;
  className?: string;
}

export function MarkdownReport({ content, className }: MarkdownReportProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none prose-headings:font-headline prose-p:font-body prose-table:border prose-th:p-2 prose-td:p-2 animate-in fade-in-50", className)}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
