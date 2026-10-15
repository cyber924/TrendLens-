
import type { DetailPageContent } from '@/lib/detail-page/schema';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Sparkles } from 'lucide-react';

interface Props {
  data: DetailPageContent;
  editable?: boolean;
  onGenerateImage?: (template: string, variables: Record<string, string>, path: string) => Promise<void>;
  isGenerating?: string | null;
}

export function FoodBuilderLayout({ data, editable, onGenerateImage, isGenerating }: Props) {
  const { page1, productName } = data;
  const heroUrl = page1.heroImageUrl?.trim() ? page1.heroImageUrl : `https://picsum.photos/seed/food-hero/860/600`;

  return (
    <div style={{ fontFamily: 'Pretendard, "Noto Serif KR", serif', color: '#1b4332', backgroundColor: '#fefaf2' }}>
      {/* 1. Traditional Top */}
      <div style={{ padding: '80px 60px 40px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <h1 style={{ fontSize: '48px', fontWeight: 700, lineHeight: '1.2', color: '#2d6a4f' }}>
                    {page1.titleLine1} <br/>
                    {page1.titleLine2Normal}
                </h1>
                <p style={{ fontSize: '20px', marginTop: '20px', color: '#52796f' }}>{page1.subtitle}</p>
            </div>
            <div style={{ writingMode: 'vertical-rl', fontSize: '13px', letterSpacing: '0.5em', borderLeft: '1px solid #2d6a4f', paddingLeft: '10px', height: '150px', color: '#2d6a4f' }}>
                세상의 모든 맛을 담다 — PREMIUM SELECT
            </div>
          </div>
      </div>

      {/* 2. Nature Hero */}
      <div style={{ width: '860px', height: '550px', position: 'relative', overflow: 'hidden' }}>
          <img key={heroUrl} src={heroUrl} alt="Food Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {editable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 hover:opacity-100 transition-opacity">
                <Button size="lg" className="bg-[#2d6a4f] text-white hover:bg-[#1b4332] gap-2 shadow-xl" onClick={() => onGenerateImage?.('lifestyle', { productName, activity: 'fresh ingredients, top view', location: 'organic wooden table' }, 'page1.heroImageUrl')}>
                    {isGenerating === 'page1.heroImageUrl' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
                    신선한 이미지 생성
                </Button>
            </div>
          )}
      </div>

      {/* 3. Round Info Grid */}
      <div style={{ padding: '100px 60px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '60px', color: '#2d6a4f' }}>
            자연이 준 <span style={{ color: '#d4a373' }}>세 가지 약속</span>
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '60px' }}>
              {page1.usp.slice(0,3).map((item, i) => {
                  const uspUrl = item.imageUrl?.trim() ? item.imageUrl : `https://picsum.photos/seed/food-point-${i}/320/320`;
                  const currentPath = `page1.usp[${i}].imageUrl`;
                  
                  return (
                    <div key={i} style={{ width: '180px' }}>
                        <div style={{ width: '160px', height: '160px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 24px', border: '4px solid #fff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'relative' }}>
                            <img src={uspUrl} alt="Point" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {editable && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="text-white bg-black/40 rounded-full" onClick={() => onGenerateImage?.('closeUp', { productName, feature: item.label }, currentPath)}>
                                        {isGenerating === currentPath ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{item.label}</div>
                        <div style={{ fontSize: '13px', color: '#888' }}>{item.num}{item.suffix} 가치 보장</div>
                    </div>
                  );
              })}
          </div>
      </div>

      {/* 4. Organic Footer */}
      <div style={{ backgroundColor: '#2d6a4f', padding: '80px 40px', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.3em', marginBottom: '20px' }}>PURE & ORGANIC</div>
          <h3 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '40px' }}>{data.page8.ctaTitleNormal}</h3>
          <Button className="bg-[#d4a373] hover:bg-[#bc8a5f] text-white px-12 h-14 text-lg rounded-none">장바구니 담기</Button>
      </div>
    </div>
  );
}
