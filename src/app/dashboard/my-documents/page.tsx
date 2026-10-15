
import { DocumentManager } from "@/components/dashboard/DocumentManager";
import { FolderArchive } from "lucide-react";

export default function MyDocumentsPage() {
  return (
    <div className="w-full">
      {/* Wide Hero Section */}
      <section className="w-full bg-[#f1f4f9] border-b-2 border-slate-200 py-16 mb-12">
          <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 text-indigo-700 text-[10px] font-black mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest animate-in slide-in-from-top-4 duration-500">
                    <FolderArchive className="h-3.5 w-3.5" /> Personal Data Archive
                </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                  나만의 <span className="text-indigo-600">AI 문서</span> 보관함
              </h1>
              <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                  TrendLens AI에서 분석하고 기획한 <span className="text-slate-900">모든 리포트와 상세페이지</span>를 한눈에 관리하세요. <br />
                  <span className="text-indigo-600">카테고리별 정렬 및 편집 기능</span>을 통해 과거의 인사이트를 즉시 비즈니스에 활용할 수 있습니다.
              </p>
          </div>
      </section>

      <div className="container mx-auto py-12 px-4 md:px-6">
        <DocumentManager />
      </div>
    </div>
  );
}
