
import type { DetailPageContent } from '@/lib/detail-page/schema';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Sparkles } from 'lucide-react';

interface Props {
  data: DetailPageContent;
  editable?: boolean;
  onGenerateImage?: (template: string, variables: Record<string, string>, path: string) => Promise<void>;
  isGenerating?: string | null;
}

export function BeautyBuilderLayout({ data, editable, onGenerateImage, isGenerating }: Props) {
  const { page1, productName } = data;
  const heroUrl = page1.heroImageUrl?.trim() ? page1.heroImageUrl : `https://picsum.photos/seed/beauty-hero/860/1200`;

  return (
    <div style={{ fontFamily: 'Pretendard, sans-serif', color: '#444', backgroundColor: '#ffffff' }}>
      {/* 1. Zen Hero */}
      <div style={{ display: 'flex', minHeight: '800px' }}>
          <div style={{ flex: '1.2', padding: '120px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '13px', letterSpacing: '0.4em', color: '#999', marginBottom: '30px' }}>THE CLEAN GIFT</div>
              <h1 style={{ fontSize: '42px', fontWeight: 300, lineHeight: '1.4', marginBottom: '40px', color: '#1a1a1a' }}>
                  {page1.titleLine1} <br/>
                  <strong style={{ fontWeight: 800 }}>{page1.titleLine2Normal}</strong>
              </h1>
              <div style={{ width: '40px', height: '1px', backgroundColor: '#1a1a1a', marginBottom: '40px' }}></div>
              <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#666' }}>{page1.subtitle}</p>
          </div>
          <div style={{ flex: '1', position: 'relative', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
              <img key={heroUrl} src={heroUrl} alt="Beauty Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {editable && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/20 opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="sm" className="bg-white text-black hover:bg-white/90 gap-2 border shadow-lg" onClick={() => onGenerateImage?.('keyVisual', { productName, vibe: 'Korean woman, glowing skin, minimalist, soft natural light' }, 'page1.heroImageUrl')}>
                        {isGenerating === 'page1.heroImageUrl' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        이미지 생성
                    </Button>
                </div>
              )}
          </div>
      </div>

      {/* 2. Round Feature Row */}
      <div style={{ padding: '100px 40px', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'center', gap: '40px' }}>
          {page1.usp.map((item, i) => {
              const uspUrl = item.imageUrl?.trim() ? item.imageUrl : `https://picsum.photos/seed/beauty-usp-${i}/240/240`;
              const currentPath = `page1.usp[${i}].imageUrl`;

              return (
                <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', marginBottom: '20px', backgroundColor: '#fff', border: '1px solid #eee', position: 'relative' }}>
                        <img src={uspUrl} alt="USP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {editable && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="text-white bg-black/30 rounded-full" onClick={() => onGenerateImage?.('closeUp', { productName, feature: `${item.label}, cosmetic texture, high detail` }, currentPath)}>
                                    {isGenerating === currentPath ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                </Button>
                            </div>
                        )}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>{item.label}</div>
                    <div style={{ fontSize: '20px', fontWeight: 300, marginTop: '5px' }}>{item.num}{item.suffix}</div>
                </div>
              );
          })}
      </div>

      {/* 3. Text Info Section */}
      <div style={{ padding: '120px 80px', textAlign: 'center', backgroundColor: '#f5f3f0' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '30px' }}>{data.page2.titleNormal}</h2>
          <p style={{ fontSize: '16px', lineHeight: '2', color: '#666', maxWidth: '600px', margin: '0 auto' }}>{data.page2.sub}</p>
      </div>

      {/* 4. Dark Elegant Footer */}
      <div style={{ backgroundColor: '#2d2420', padding: '100px 40px', textAlign: 'center', color: '#fff' }}>
          <h3 style={{ fontSize: '32px', fontWeight: 300, marginBottom: '50px', letterSpacing: '0.1em' }}>{data.page8.ctaTitleNormal}</h3>
          <button style={{ backgroundColor: '#fff', color: '#2d2420', padding: '20px 60px', fontSize: '16px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
            SHOP NOW
          </button>
      </div>
    </div>
  );
}
