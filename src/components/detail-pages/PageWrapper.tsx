import React from 'react';

interface PageWrapperProps {
  pageNum: number;
  pageTotal: number;
  children: React.ReactNode;
}

export function PageWrapper({ pageNum, pageTotal, children }: PageWrapperProps) {
  return (
    <div 
      id={`detail-page-${pageNum}`}
      className="detail-page detail-page-container relative shadow-sm mb-8"
      style={{
        width: '860px',
        background: 'var(--dp-bg)',
        overflow: 'hidden',
      }}
      data-page-num={pageNum}
      data-page-total={pageTotal}
    >
      {children}
    </div>
  );
}