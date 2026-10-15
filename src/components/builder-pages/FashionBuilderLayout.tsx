
import type { DetailPageContent } from '@/lib/detail-page/schema';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Sparkles } from 'lucide-react';

interface Props {
  data: DetailPageContent;
  editable?: boolean;
  onGenerateImage?: (template: string, variables: Record<string, string>, path: string) => Promise<void>;
  isGenerating?: string | null;
}

export function FashionBuilderLayout({ data, editable, onGenerateImage, isGenerating }: Props) {
  const { page1, productName, season } = data;
  const heroUrl = page1.heroImageUrl?.trim() ? page1.heroImageUrl : `https://picsum.photos/seed/fashion-hero/860/1000`;

  return (
    <div style={{ fontFamily: 'Pretendard, sans-serif', color: '#1a1a1a', backgroundColor: '#ffffff' }}>
      {/* 1. Impact Hero */}
      <div style={{ position: 'relative', width: '860px', height: '900px', overflow: 'hidden' }}>
        <img key={heroUrl} src={heroUrl} alt="Fashion Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8))' }}></div>
        <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
            <span style={{ backgroundColor: '#e63946', color: '#fff', padding: '4px 12px', fontSize: '12px', fontWeight: 900, borderRadius: '2px' }}>{season} NEW</span>
        </div>
        <div style={{ position: 'absolute', bottom: '80px', left: '60px', right: '60px' }}>
            <h1 style={{ color: '#fff', fontSize: '56px', fontWeight: 900, lineHeight: '1', marginBottom: '20px', letterSpacing: '-0.04em' }}>
                {page1.titleLine1} <br/>
                <span style={{ color: '#e63946' }}>{page1.titleLine2Italic}</span>
            </h1>
            <p style={{ color: '#ccc', fontSize: '18px', maxWidth: '500px' }}>{page1.subtitle}</p>
        </div>
        {editable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 gap-2 shadow-2xl" onClick={() => onGenerateImage?.('keyVisual', { productName, vibe: 'stylish Korean woman, editorial, high-fashion, street style' }, 'page1.heroImageUrl')}>
              {isGenerating === 'page1.heroImageUrl' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
              메인 비주얼 생성
            </Button>
          </div>
        )}
      </div>

      {/* 2. Highlight Grid */}
      <div style={{ padding: '80px 40px', backgroundColor: '#f9f9f9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div style={{ padding: '40px', backgroundColor: '#fff', borderLeft: '4px solid #e63946', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>Concept</h3>
                  <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.8' }}>{data.page2.sub}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {page1.usp.map((item, i) => {
                      const uspUrl = item.imageUrl?.trim() ? item.imageUrl : `https://picsum.photos/seed/fashion-point-${i}/300/300`;
                      const currentPath = `page1.usp[${i}].imageUrl`;
                      
                      return (
                        <div key={i} style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ width: '100%', aspectRatio: '1/1', marginBottom: '15px', position: 'relative', borderRadius: '4px', overflow: 'hidden' }}>
                                <img src={uspUrl} alt="USP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {editable && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="text-white bg-black/40 rounded-full" onClick={() => onGenerateImage?.('lifestyle', { productName, activity: `wearing ${productName}, Korean model`, location: 'urban outdoor' }, currentPath)}>
                                            {isGenerating === currentPath ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: 900, color: '#e63946' }}>{item.num}{item.suffix}</div>
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{item.label}</div>
                        </div>
                      );
                  })}
              </div>
          </div>
      </div>

      {/* 3. Detail Gallery */}
      <div style={{ padding: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {data.page4.details.map((detail, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                      <img src={detail.imageUrl?.trim() || `https://picsum.photos/seed/fashion-detail-${i}/430/430`} alt="Detail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '0', left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: '#fff' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700 }}>{detail.title}</div>
                      </div>
                      {editable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="secondary" className="h-8 text-[10px] gap-1" onClick={() => onGenerateImage?.('closeUp', { productName, feature: detail.title }, `page4.details[${i}].imageUrl`)}>
                                {isGenerating === `page4.details[${i}].imageUrl` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} 생성
                            </Button>
                        </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* 4. Impact Footer */}
      <div style={{ backgroundColor: '#e63946', padding: '100px 40px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '40px' }}>{data.page8.ctaTitleNormal}</h2>
          <div style={{ fontSize: '14px', letterSpacing: '0.2em', border: '1px solid #fff', display: 'inline-block', padding: '12px 30px', fontWeight: 700 }}>GET IT NOW</div>
      </div>
    </div>
  );
}
