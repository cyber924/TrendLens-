
"use client";

import React, { forwardRef } from 'react';

type HtmlPreviewProps = {
  htmlContent: string;
};

export const HtmlPreview = forwardRef<HTMLDivElement, HtmlPreviewProps>(({ htmlContent }, ref) => {
  return (
    <div ref={ref}>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
});

HtmlPreview.displayName = 'HtmlPreview';
