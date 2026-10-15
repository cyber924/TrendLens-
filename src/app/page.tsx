import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, 
  BarChart3, 
  Lightbulb, 
  Megaphone, 
  Upload, 
  Zap, 
  PlayCircle, 
  CheckCircle2, 
  Star,
  Layers,
  Sparkles,
  Search,
  LayoutTemplate,
  ImageIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const stats = [
  { label: "활성 브랜드", value: "3,200+" },
  { label: "분석된 데이터 포인트", value: "12억+" },
  { label: "평균 매출 상승률", value: "73%" },
  { label: "주간 절약 시간", value: "8.5시간" },
];

const features = [
  {
    icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
    title: "AI 트렌드 분석기",
    description: "네이버, 쿠팡, 지그재그 등 주요 이커머스 채널의 실시간 인기 키워드와 라이징 아이템을 초단위로 포착합니다."
  },
  {
    icon: <Lightbulb className="w-5 h-5 text-amber-600" />,
    title: "AI 상품 추천기",
    description: "시장 데이터와 소비자 리뷰를 다각도로 분석하여 현재 소싱했을 때 가장 성공 확률이 높은 상품을 제안합니다."
  },
  {
    icon: <Megaphone className="w-5 h-5 text-rose-600" />,
    title: "AI 마케팅 어시스턴트",
    description: "선택된 트렌드와 상품에 딱 맞는 광고 카피, SNS 게시물, 이메일 뉴스레터 본문을 10초 만에 작성합니다."
  },
  {
    icon: <LayoutTemplate className="w-5 h-5 text-emerald-600" />,
    title: "AI 상세페이지 빌더",
    description: "상품 정보만으로도 무신사, 29CM 감성의 고퀄리티 상세페이지 레이아웃과 소구 포인트를 자동 설계합니다."
  },
  {
    icon: <ImageIcon className="w-5 h-5 text-violet-600" />,
    title: "AI 비주얼 스튜디오",
    description: "직접 촬영하지 않아도 AI가 모델 착용 컷부터 라이프스타일 연출 컷까지 고해상도 이미지를 직접 생성합니다."
  },
  {
    icon: <Upload className="w-5 h-5 text-blue-600" />,
    title: "CSV 분석 업로드",
    description: "보유 중인 내부 판매 데이터를 업로드하면 AI가 트렌드와 비교 분석하여 최적의 재고 전략을 도출합니다."
  }
];

const steps = [
  { num: "01", title: "데이터 수집", desc: "주요 마켓플레이스의 실시간 동향 파악" },
  { num: "02", title: "트렌드 포착", desc: "상승 기류를 타는 핵심 키워드 도출" },
  { num: "03", title: "콘텐츠 생성", desc: "상품 기획 및 마케팅 전략 자동 수립" },
  { num: "04", title: "매출 증대", desc: "최적화된 상세페이지와 광고로 구매 전환" },
];

const useCases = [
  {
    category: "의류 · 잡화",
    title: "시즌 트렌드를 놓치고 싶지 않은 패션몰",
    desc: "FW 시즌 주력 아이템인 '트위드 자켓'의 세부 트렌드(크롭 기장, 진주 버튼 등)를 미리 파악하여 소싱에 반영, 전년 대비 매출 140% 상승.",
    metrics: ["매출 2.4배 상승", "광고 ROAS 480%"]
  },
  {
    category: "뷰티 · 코스메틱",
    title: "리뷰 데이터로 다음 히트템을 찾는 뷰티 브랜드",
    desc: "경쟁사 7개 제품의 고객 리뷰 5만 건을 분석하여 '끈적임 없는 수분감'에 대한 갈망을 포착, 신제품 제형에 반영하여 출시 1달 만에 완판.",
    metrics: ["완판까지 22일", "고객 만족도 4.9/5.0"]
  }
];

export default function Home() {
  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      {/* --- Hero Section --- */}
      <section className="w-full pt-16 pb-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-12 lg:grid-cols-[1fr_520px] items-center">
            <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold w-fit">
                <Sparkles className="w-3 h-3" />
                <span>2026 신규 Gemini 2.0 기반 AI 엔진</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl font-headline text-slate-900 leading-[1.15]">
                  쇼핑 트렌드를 <br />
                  <span className="text-indigo-600">먼저 보는 사람</span>이 <br />
                  시장을 이깁니다.
                </h1>
                <p className="max-w-[520px] text-slate-500 text-xs md:text-sm font-medium leading-relaxed">
                  네이버 · 쿠팡 · 지그재그의 무수한 실시간 트렌드를 분석하여 비즈니스 모델, 상세 페이지, 마케팅 전략까지 자동 생성하는 올인원 AI SaaS 워크스페이스.
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row pt-2">
                <Button asChild size="lg" className="h-12 px-7 bg-indigo-600 hover:bg-indigo-700 text-sm font-bold shadow-lg shadow-indigo-200">
                  <Link href="/signup">
                    14일 무료 체험 시작
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-7 text-sm font-semibold border-2 border-slate-200">
                  <Link href="#features">
                    <PlayCircle className="mr-2 h-4 w-4 text-slate-400" />
                    서비스 둘러보기
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400"><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/></div>
                  <span className="font-bold text-slate-700">4.9/5.0</span>
                  <span className="text-slate-400">— 신뢰하는 쇼핑몰 3,200+곳</span>
                </div>
              </div>
            </div>
            
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-rose-500/20 rounded-[2rem] blur-2xl opacity-40" />
              <div className="relative bg-white rounded-[1.5rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] border-3 border-slate-900 overflow-hidden">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/trendlens-ai-3wqa7.firebasestorage.app/o/studio_images%2Fu9cB5u4DC4gkJe6h9TPsndJh2Af1%2Flifestyle-1778650372228.png?alt=media&token=4e7999d8-54c7-4d8b-9061-544d79bea603"
                  width={1000}
                  height={750}
                  alt="TrendLens AI Hero"
                  className="w-full h-auto object-cover"
                />
                {/* Floating Animated Badges */}
                <div className="absolute inset-0 pointer-events-none select-none">
                  <div className="absolute top-[8%] left-[8%] bg-white border-2 border-slate-900 px-3 py-1.5 rounded-md text-[11px] font-black text-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                    실시간 트렌드 분석
                  </div>
                  <div className="absolute bottom-[18%] right-[8%] bg-indigo-600 border-2 border-slate-900 px-3 py-1.5 rounded-md text-[11px] font-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-pulse" style={{ animationDelay: '0.5s' }}>
                    TrendLens AI 2026
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Stats Bar --- */}
      <section className="w-full py-10 border-y border-slate-200 bg-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center md:items-start space-y-0.5">
                <span className="text-2xl md:text-3xl font-extrabold text-slate-900">{stat.value}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* --- Features Section (Compact & Sleek Cards) --- */}
      <section id="features" className="w-full py-20 bg-slate-50/50">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">CORE FEATURES</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-headline">
              성공적인 이커머스를 위한 <br /> AI 기능 6가지
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              시장 분석부터 상세페이지 제작, 마케팅 전략까지 단 한 곳에서 해결하세요.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="group relative border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden bg-white rounded-xl">
                <CardHeader className="pt-6 px-6 pb-2">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- Pipeline Section --- */}
      <section className="w-full py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container px-4 mx-auto relative z-10">
          <div className="text-center space-y-3 mb-16">
            <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">WORKFLOW PIPELINE</span>
            <h2 className="text-2xl md:text-4xl font-bold font-headline">트렌드 포착부터 매출 증대까지</h2>
            <p className="text-slate-400 max-w-lg mx-auto text-xs font-medium">복잡한 데이터 분석을 비즈니스 성과로 직결시키는 4단계 파이프라인.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative space-y-3 text-center md:text-left bg-slate-800/60 p-6 rounded-xl border border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs mx-auto md:mx-0 shadow-md">
                  {step.num}
                </div>
                <h4 className="text-sm font-bold text-white">{step.title}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Use Case Section --- */}
      <section className="w-full py-20 bg-white">
        <div className="container px-4 mx-auto">
           <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">SUCCESS STORIES</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-headline">
              이런 브랜드들이 함께하고 있습니다
            </h2>
            <p className="text-sm text-slate-500 font-medium">실제 데이터 기반의 성공 사례를 확인하세요.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase, idx) => (
              <div key={idx} className="bg-slate-50/60 border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 space-y-4 rounded-xl">
                <div className="inline-block px-2.5 py-1 rounded bg-white border border-slate-200 text-indigo-600 text-[11px] font-bold uppercase">{useCase.category}</div>
                <h3 className="text-lg font-bold text-slate-900">{useCase.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">{useCase.desc}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {useCase.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Final CTA Section --- */}
      <section className="w-full py-20 bg-slate-50">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="bg-indigo-600 rounded-[2rem] p-10 md:p-16 text-center space-y-6 relative overflow-hidden shadow-xl shadow-indigo-100 border-2 border-slate-900">
            <div className="relative z-10 space-y-3">
              <h2 className="text-2xl md:text-4xl font-black text-white font-headline tracking-tight">지금 시작하여 다음 시즌을 선점하세요.</h2>
              <p className="text-indigo-100 max-w-md mx-auto text-xs md:text-sm font-medium opacity-90">신규 가입 시 첫 14일 무료 체험 기간이 제공됩니다.</p>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-lg border-2 border-slate-900">
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-50 text-sm font-bold border-2 border-slate-900">
                <Link href="/pricing">요금제 보기</Link>
              </Button>
            </div>
            
            <div className="relative z-10 flex items-center justify-center gap-6 text-white/80 text-xs font-semibold pt-2">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-200" /> 카드 등록 불필요</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-200" /> 언제든 해지 가능</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
