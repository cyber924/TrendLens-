
import type { DetailPageContent } from '@/lib/detail-page/schema';

interface Props {
  data: DetailPageContent['page2'];
}

export function Page2Problem({ data }: Props | { data: undefined }) {
  if (!data) return null;

  return (
    <div style={{ width: '860px', backgroundColor: '#fafaf7', color: '#0a0a0a', padding: '120px 60px', fontFamily: 'Pretendard, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h2 style={{ fontSize: '42px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          {data.titleNormal} <span style={{ fontStyle: 'italic', fontFamily: 'Playfair Display', color: '#e63946' }}>{data.titleItalic}</span>
        </h2>
        <p style={{ fontSize: '18px', color: '#555', marginTop: '24px', wordBreak: 'keep-all' }}>{data.sub}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {data.problems.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#e63946', fontFamily: 'JetBrains Mono' }}>0{i+1}</span>
            <p style={{ fontSize: '16px', fontWeight: 500, lineHeight: 1.6, color: '#333', wordBreak: 'keep-all', margin: 0 }}>{p}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '100px', padding: '40px', backgroundColor: '#ffffff', border: '1px solid #e5e5e5', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#555', margin: 0 }}>
          {data.bottomCtaText} <strong style={{ color: '#0a0a0a', fontWeight: 800 }}>{data.bottomCtaStrong}</strong>
        </p>
      </div>
    </div>
  );
}
