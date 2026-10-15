
"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

type HtmlEditorProps = {
  initialHtml: string;
  onHtmlChange: (html: string) => void;
};

export function HtmlEditor({ initialHtml, onHtmlChange }: HtmlEditorProps) {
  const [html, setHtml] = useState(initialHtml);

  useEffect(() => {
    setHtml(initialHtml);
  }, [initialHtml]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtml(newHtml);
    onHtmlChange(newHtml);
  };

  return (
    <Textarea
      value={html}
      onChange={handleChange}
      className="w-full h-[60vh] font-mono text-xs"
      placeholder="HTML content..."
    />
  );
}
