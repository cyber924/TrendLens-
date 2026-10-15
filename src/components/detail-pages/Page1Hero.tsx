
import type { DetailPageContent } from '@/lib/detail-page/schema';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';

interface Props {
  data: DetailPageContent['page1'];
  productName: string;
  productNameEn: string;
  season: string;
  editable?: boolean;
  onGenerateImage?: (template: string, variables: Record<string, string>, path: string) => Promise<void>;
  isGenerating?: boolean;
}

export function Page1Hero({ data, productName, productNameEn, season, editable, onGenerateImage, isGenerating }: Props) {
  const containerStyle: React.CSSProperties = {
    width: '860px',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: 'Pretendard, sans-serif',
    display: 'flex',
    flexDirection: 'column'
  };

  const textLayerStyle: React.CSSProperties = {
    padding: '60px 60px 80px 60px',
    zIndex: 10
  };

  // Picsum을 활용한 안정적인 플레이스홀더 (사용자 요청 반영)
  const heroUrl = data.heroImageUrl?.trim() 
    ? data.heroImageUrl 
    : "https://picsum.photos/seed/hero/860/1075";

  return (
    <div style={containerStyle}>
      {/* Hero Image Section */}
      <div style={{ width: '860px', aspectRatio: '4/5', backgroundColor: '#1a1a1a', overflow: 'hidden', position: 'relative' }}>
        <img 
          key={heroUrl}
          src={heroUrl} 
          alt="Hero" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        {editable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity z-20">
            <Button 
              size="sm" 
              className="bg-white text-black hover:bg-white/90 gap-2"
              disabled={isGenerating}
              onClick={() => onGenerateImage?.('keyVisual', { productName, vibe: 'minimal, editorial' }, 'page1.heroImageUrl')}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              이미지 생성
            </Button>
          </div>
        )}
      </div>

      {/* Floating Badge */}
      <div style={{ position: 'absolute', top: '40px', left: '60px', display: 'flex', gap: '12px', alignItems: 'center', zIndex: 30 }}>
        <span style={{ fontSize: '12px', fontWeight: 800, backgroundColor: '#e63946', padding: '4px 8px', borderRadius: '2px', fontFamily: 'JetBrains Mono' }}>
          NEW · {season}
        </span>
        <span style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', fontFamily: 'JetBrains Mono', color: '#ffffff' }}>
          {productNameEn.toUpperCase()}
        </span>
      </div>

      <div style={textLayerStyle}>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '16px', letterSpacing: '0.2em', fontFamily: 'JetBrains Mono' }}>
          {data.eyebrow}
        </div>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 700, 
          lineHeight: 1.1, 
          letterSpacing: '-0.04em', 
          margin: 0, 
          wordBreak: 'keep-all',
          whiteSpace: 'nowrap'
        }}>
          {data.titleLine1} {data.titleLine2Normal} <span style={{ color: '#e63946', fontStyle: 'italic', fontFamily: 'Playfair Display' }}>{data.titleLine2Italic}</span>
        </h1>
        <p style={{ fontSize: '16px', color: '#ccc', marginTop: '24px', maxWidth: '600px', lineHeight: 1.6, wordBreak: 'keep-all' }}>
          {data.subtitle}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '50px', borderTop: '1px solid #333', paddingTop: '40px' }}>
          {data.usp.map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Playfair Display' }}>
                {item.num}<span style={{ fontSize: '14px', color: '#e63946', verticalAlign: 'super' }}>{item.suffix}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '8px', wordBreak: 'keep-all' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
