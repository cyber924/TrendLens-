
import type { DetailPageContent } from '@/lib/detail-page/schema';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, HardDrive, Sparkles } from 'lucide-react';

interface Props {
  data: DetailPageContent;
  editable?: boolean;
  onGenerateImage?: (template: string, variables: Record<string, string>, path: string) => Promise<void>;
  isGenerating?: string | null;
}

export function LivingBuilderLayout({ data, editable, onGenerateImage, isGenerating }: Props) {
  const { page1, productName } = data;
  const heroUrl = page1.heroImageUrl?.trim() ? page1.heroImageUrl : `https://picsum.photos/seed/living-hero/860/600`;

  return (
    <div style={{ fontFamily: 'Pretendard, sans-serif', color: '#1a1a1a', backgroundColor: '#ffffff' }}>
      {/* 1. Technical Hero */}
      <div style={{ padding: '80px 60px' }}>
          <div style={{ marginBottom: '60px' }}>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#007bff', letterSpacing: '0.2em', marginBottom: '16px' }}>ENGINEERED FOR PERFORMANCE</div>
              <h1 style={{ fontSize: '64px', fontWeight: 900, lineHeight: '1', letterSpacing: '-0.05em', margin: 0 }}>
                  {page1.titleLine1.toUpperCase()} <br/>
                  <span style={{ color: '#007bff' }}>{page1.titleLine2Normal.toUpperCase()}</span>
              </h1>
          </div>

          <div style={{ width: '860px', marginLeft: '-60px', position: 'relative', height: '550px', backgroundColor: '#000', overflow: 'hidden' }}>
              <img key={heroUrl} src={heroUrl} alt="Tech Hero" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
              {editable && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="lg" className="bg-[#007bff] text-white hover:bg-[#0056b3] gap-2 shadow-2xl" onClick={() => onGenerateImage?.('keyVisual', { productName: `Modern ${productName}`, vibe: 'technical, futuristic, studio lighting, clean background' }, 'page1.heroImageUrl')}>
                        {isGenerating === 'page1.heroImageUrl' ? <Loader2 className="h-5 w-5 animate-spin" /> : <HardDrive className="h-5 w-5" />}
                        {productName} 비주얼 생성
                    </Button>
                </div>
              )}
          </div>
      </div>

      {/* 2. Feature Cards */}
      <div style={{ padding: '60px', backgroundColor: '#f8f9fa' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {page1.usp.slice(0, 4).map((item, i) => {
                  const uspUrl = item.imageUrl?.trim() ? item.imageUrl : `https://picsum.photos/seed/living-usp-${i}/400/300`;
                  const currentPath = `page1.usp[${i}].imageUrl`;

                  return (
                    <div key={i} style={{ backgroundColor: '#fff', padding: '0', border: '1px solid #eee', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', height: '200px', backgroundColor: '#f0f0f0' }}>
                             <img src={uspUrl} alt="Feature" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                             {editable && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="secondary" className="h-8 gap-1" onClick={() => onGenerateImage?.('closeUp', { productName, feature: item.label }, currentPath)}>
                                        {isGenerating === currentPath ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} 이미지 생성
                                    </Button>
                                </div>
                             )}
                        </div>
                        <div style={{ padding: '25px' }}>
                            <div style={{ color: '#007bff', fontSize: '12px', fontWeight: 900, marginBottom: '8px' }}>FEATURE 0{i+1}</div>
                            <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{item.label}</h4>
                            <p style={{ fontSize: '13px', color: '#666' }}>{item.num}{item.suffix}의 압도적 성능</p>
                        </div>
                    </div>
                  );
              })}
          </div>
      </div>

      {/* 3. Spec Table Section */}
      <div style={{ padding: '100px 60px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '40px', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px' }}>SPECIFICATIONS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', backgroundColor: '#eee', border: '1px solid #eee' }}>
               {data.page4.highlight.specs.map((spec, i) => (
                   <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', backgroundColor: '#fff' }}>
                       <span style={{ fontWeight: 800, fontSize: '14px' }}>{spec.split(':')[0]}</span>
                       <span style={{ color: '#007bff', fontSize: '14px', fontWeight: 500 }}>{spec.split(':')[1]}</span>
                   </div>
               ))}
               <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', backgroundColor: '#fff' }}>
                   <span style={{ fontWeight: 800, fontSize: '14px' }}>WARRANTY</span>
                   <span style={{ color: '#007bff', fontSize: '14px', fontWeight: 500 }}>2 YEARS</span>
               </div>
          </div>
      </div>

      {/* 4. Tech Blue Footer */}
      <div style={{ backgroundColor: '#007bff', padding: '80px 40px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '40px' }}>START THE FUTURE.</h2>
          <button style={{ backgroundColor: '#000', color: '#fff', padding: '15px 50px', fontSize: '14px', fontWeight: 900, border: 'none', cursor: 'pointer' }}>
            BUY NOW
          </button>
      </div>
    </div>
  );
}
