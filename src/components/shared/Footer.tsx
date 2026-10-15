
import Link from "next/link";
import Logo from "../icons/Logo";
import { Facebook, Instagram, Github, Twitter, Youtube } from "lucide-react";

const footerLinks = [
  {
    title: "제품",
    links: [
      { name: "트렌드 분석", href: "/trends" },
      { name: "상품 추천", href: "/recommendations" },
      { name: "상세페이지 빌더", href: "/details/studio" },
      { name: "마케팅 어시스턴트", href: "/marketing" },
      { name: "요금제", href: "/pricing" },
    ]
  },
  {
    title: "회사",
    links: [
      { name: "회사 소개", href: "/about" },
      { name: "브랜드 리소스", href: "/brand" },
      { name: "문의하기", href: "/contact" },
      { name: "공지사항", href: "/news" },
    ]
  },
  {
    title: "리소스",
    links: [
      { name: "사용 가이드", href: "/docs" },
      { name: "블로그", href: "/blog" },
      { name: "커뮤니티", href: "/community" },
      { name: "파트너 프로그램", href: "/partners" },
    ]
  }
];

export default function Footer() {
  return (
    <footer className="bg-white border-t-4 border-slate-900 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          <div className="lg:col-span-2 space-y-5">
            <Link className="flex items-center space-x-2" href="/">
              <Logo className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tight">TrendLens <span className="text-indigo-600">AI</span></span>
            </Link>
            <p className="text-slate-400 max-w-sm leading-relaxed font-medium text-[11px]">
              쇼핑몰 사장님들의 고민을 해결하는 AI 워크스페이스. <br /> 
              전 세계 이커머스 데이터를 실시간으로 분석하여 <br />
              당신의 비즈니스를 성장의 길로 안내합니다.
            </p>
            <div className="flex items-center gap-3 text-slate-300">
               <Link href="#" className="hover:text-indigo-600 transition-colors"><Facebook className="w-4 h-4"/></Link>
               <Link href="#" className="hover:text-indigo-600 transition-colors"><Instagram className="w-4 h-4"/></Link>
               <Link href="#" className="hover:text-indigo-600 transition-colors"><Twitter className="w-4 h-4"/></Link>
               <Link href="#" className="hover:text-indigo-600 transition-colors"><Youtube className="w-4 h-4"/></Link>
               <Link href="#" className="hover:text-indigo-600 transition-colors"><Github className="w-4 h-4"/></Link>
            </div>
          </div>
          
          {footerLinks.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">{section.title}</h4>
              <ul className="space-y-1.5">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link href={link.href} className="text-slate-500 hover:text-indigo-600 font-medium transition-colors text-[11px]">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
          <div className="text-center md:text-left leading-relaxed">
            © {new Date().getFullYear()} TrendLens AI Inc. All rights reserved. <br />
            (주)트렌드렌즈 에이아이 | 대표: 윤지윤 | 사업자등록번호: 123-45-67890
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">이용약관</Link>
            <Link href="/cookies" className="hover:text-indigo-600 transition-colors">쿠키 정책</Link>
            <Link href="/sitemap" className="hover:text-indigo-600 transition-colors">사이트맵</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
