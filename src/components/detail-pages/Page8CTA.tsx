
import type { DetailPageContent } from '@/lib/detail-page/schema';

interface Props {
  data: DetailPageContent['page8'];
  productName: string;
}

export function Page8CTA({ data, productName }: Props | { data: undefined, productName: string }) {
  if (!data) return null;

  return (
    <div style={{ width: '860px', backgroundColor: '#0a0a0a', color: '#ffffff', padding: '120px 60px', fontFamily: 'Pretendard, sans-serif', textAlign: 'center' }}>
      {/* FAQ Section */}
      <div style={{ marginBottom: '120px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '60px', textAlign: 'center' }}>
          {data.faqTitleNormal} <span style={{ fontStyle: 'italic', fontFamily: 'Playfair Display', color: '#e63946' }}>{data.faqTitleItalic}</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {data.faqs.map((faq, i) => (
            <div key={i} style={{ padding: '30px', backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
              <div style={{ color: '#e63946', fontSize: '12px', fontWeight: 800, marginBottom: '12px', fontFamily: 'JetBrains Mono' }}>Q.</div>
              <h5 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>{faq.q}</h5>
              <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA Section */}
      <div style={{ paddingTop: '80px', borderTop: '1px solid #333' }}>
        <div style={{ fontSize: '14px', color: '#888', letterSpacing: '0.2em', marginBottom: '20px', fontFamily: 'JetBrains Mono' }}>LIMITED OFFER</div>
        <h2 style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.2, margin: 0 }}>
          {data.ctaTitleNormal} <br />
          <span style={{ fontStyle: 'italic', fontFamily: 'Playfair Display', color: '#e63946' }}>{data.ctaTitleItalic}</span>
        </h2>
        
        <div style={{ marginTop: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666', textDecoration: 'line-through' }}>₩{data.originalPrice.toLocaleString()}</div>
          <div style={{ fontSize: '56px', fontWeight: 800, marginTop: '10px' }}>
            <span style={{ color: '#e63946', marginRight: '16px' }}>{data.discountPercent}%</span>
            ₩{data.currentPrice.toLocaleString()}
          </div>
        </div>

        <button style={{ 
          marginTop: '60px', 
          backgroundColor: '#e63946', 
          color: '#ffffff', 
          width: '100%', 
          maxWidth: '400px', 
          height: '70px', 
          fontSize: '20px', 
          fontWeight: 800, 
          border: 'none', 
          cursor: 'pointer',
          fontFamily: 'Pretendard'
        }}>
          지금 구매하기
        </button>
        
        <p style={{ marginTop: '24px', fontSize: '12px', color: '#555' }}>
          {productName} 공식 스토어에서만 제공되는 혜택입니다.
        </p>
      </div>
    </div>
  );
}
