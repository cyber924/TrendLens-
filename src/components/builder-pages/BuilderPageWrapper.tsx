
import React from 'react';

interface Props {
  pageNum: number;
  children: React.ReactNode;
}

export function BuilderPageWrapper({ pageNum, children }: Props) {
  return (
    <div 
      id={`detail-page-${pageNum}`}
      className="builder-page-container relative shadow-2xl mb-8 bg-[#ffffff] overflow-hidden"
      style={{
        width: '860px',
        margin: '0 auto',
      }}
    >
      {children}
    </div>
  );
}
