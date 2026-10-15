
import type { DetailPageContent } from '@/lib/detail-page/schema';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';

interface Props {
  data: DetailPageContent['page4'];
  productName: string;
  editable?: boolean;
  onGenerateImage?: (template: string, variables: Record<string, string>, path: string) => Promise<void>;
  isGenerating?: string | null;
}

export function Page4Detail({ data, productName, editable, onGenerateImage, isGenerating }: Props) {
  if (!data) return null;

  return (
    <div style={{ width: '860px', backgroundColor: '#ffffff', color: '#0a0a0a', fontFamily: 'Pretendard, sans-serif' }}>
      {/* 2x2 Image Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #e5e5e5' }}>
        {data.details.map((detail, i) => {
          const detailUrl = detail.imageUrl?.trim() 
            ? detail.imageUrl 
            : `https://picsum.photos/seed/detail-${i}/430/430`;
          
          return (
            <div key={i} style={{ borderRight: i % 2 === 0 ? '1px solid #e5e5e5' : 'none', borderBottom: i < 2 ? '1px solid #e5e5e5' : 'none' }}>
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#f5f5f5', position: 'relative' }}>
                <img 
                  key={detailUrl}
                  src={detailUrl} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  alt="Detail" 
                />
                {editable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity z-20">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="h-8 text-[10px] gap-1.5"
                      disabled={!!isGenerating}
                      onClick={() => onGenerateImage?.('closeUp', { productName, feature: detail.title }, `page4.details[${i}].imageUrl`)}
                    >
                      {isGenerating === `page4.details[${i}].imageUrl` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                      이미지 생성
                    </Button>
                  </div>
                )}
              </div>
              <div style={{ padding: '30px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>{detail.title}</h4>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, wordBreak: 'keep-all', margin: 0 }}>{detail.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Highlight Section */}
      <div style={{ padding: '100px 60px', backgroundColor: '#fafaf7' }}>
        <div style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1.2 }}>
              {data.highlight.titleNormal} <br />
              <span style={{ fontStyle: 'italic', fontFamily: 'Playfair Display', color: '#e63946' }}>{data.highlight.titleItalic}</span>
            </h3>
            <p style={{ fontSize: '16px', color: '#555', marginTop: '24px', lineHeight: 1.8, wordBreak: 'keep-all' }}>{data.highlight.desc}</p>
            <ul style={{ marginTop: '40px', listStyle: 'none', padding: 0 }}>
              {data.highlight.specs.map((s, i) => (
                <li key={i} style={{ fontSize: '14px', fontWeight: 600, color: '#0a0a0a', paddingBottom: '12px', borderBottom: '1px solid #e5e5e5', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{s.split(':')[0]}</span>
                  <span style={{ color: '#e63946' }}>{s.split(':')[1]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: 1, aspectRatio: '3/4', backgroundColor: '#e5e5e5', overflow: 'hidden', position: 'relative' }}>
             <img 
                key={data.highlight.imageUrl}
                src={data.highlight.imageUrl?.trim() ? data.highlight.imageUrl : "https://picsum.photos/seed/highlight/400/533"} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                alt="Highlight" 
             />
             {editable && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity z-20">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="h-8 text-[10px] gap-1.5"
                    disabled={!!isGenerating}
                    onClick={() => onGenerateImage?.('lifestyle', { productName, activity: 'styling', location: 'studio' }, 'page4.highlight.imageUrl')}
                  >
                    {isGenerating === 'page4.highlight.imageUrl' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                    이미지 생성
                  </Button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
