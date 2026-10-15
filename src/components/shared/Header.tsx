
"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ChevronDown, LogOut, Lightbulb, BotMessageSquare, PencilRuler, AreaChart, FolderArchive, Search, AppWindow, ImageIcon, FileSearch, Zap, BrainCircuit, User, LayoutDashboard, Sparkles, Bot, LayoutTemplate } from "lucide-react"
import Logo from "../icons/Logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase/client"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function Header() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "로그아웃 성공",
        description: "성공적으로 로그아웃되었습니다.",
      });
      router.push("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      toast({ variant: "destructive", title: "로그아웃 실패", description: "로그아웃 중 오류가 발생했습니다." });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center mx-auto px-4">
        <div className="mr-8 hidden md:flex items-center">
          <Link className="mr-8 flex items-center space-x-2" href="/">
            <Logo className="h-7 w-7" />
            <span className="hidden font-bold sm:inline-block text-xl tracking-tight text-slate-900">
              TrendLens <span className="text-indigo-600">AI</span>
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-semibold text-slate-600">
             {user && (
               <>
                <Link href="/dashboard" className="transition-colors hover:text-indigo-600 flex items-center">
                  <LayoutDashboard className="w-4 h-4 mr-1.5 opacity-70" />
                  대시보드
                </Link>
                <Link href="/dashboard/my-documents" className="transition-colors hover:text-indigo-600 flex items-center">
                  <FolderArchive className="w-4 h-4 mr-1.5 opacity-70" />
                  내 문서함
                </Link>
                <Link href="/admin/images" className="transition-colors hover:text-indigo-600 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-1.5 opacity-70" />
                  갤러리
                </Link>
                <Link href="/milo" className="transition-all hover:text-indigo-600 flex items-center px-3 py-1.5 bg-indigo-50 border-2 border-slate-900 rounded-lg text-indigo-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:shadow-none">
                  <Sparkles className="w-4 h-4 mr-1.5 animate-pulse" />
                  마일로 AI
                </Link>
               </>
             )}
             
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <button className="flex items-center transition-colors hover:text-indigo-600 outline-none">
                  트렌드 분석
                  <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <DropdownMenuLabel className="text-xs text-slate-400">분석 도구</DropdownMenuLabel>
                <DropdownMenuItem asChild className="cursor-pointer py-2">
                  <Link href="/trends"><AreaChart className="mr-2 h-4 w-4 text-indigo-500"/>AI 트렌드 분석기</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild className="cursor-pointer py-2">
                  <Link href="/trends/live-analysis"><FileSearch className="mr-2 h-4 w-4 text-indigo-500"/>실시간 동향 분석</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2">
                  <Link href="/trends/hot100"><Search className="mr-2 h-4 w-4 text-indigo-500"/>HOT 100</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild className="cursor-pointer py-2">
                  <Link href="/analysis/competitor"><User className="mr-2 h-4 w-4 text-indigo-500"/>경쟁사 분석</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <button className="flex items-center transition-colors hover:text-indigo-600 outline-none">
                  콘텐츠 생성
                  <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-2 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                 <DropdownMenuItem asChild className="cursor-pointer py-2">
                  <Link href="/details/studio"><AppWindow className="mr-2 h-4 w-4 text-violet-500" />AI 프리미엄 상세페이지 (4P)</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild className="cursor-pointer py-2">
                  <Link href="/details/generate"><LayoutTemplate className="mr-2 h-4 w-4 text-violet-500" />AI 상세 페이지 빌더 (1P)</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild className="cursor-pointer py-2">
                  <Link href="/details/image-studio"><ImageIcon className="mr-2 h-4 w-4 text-violet-500" />AI 상세 이미지 스튜디오</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2 border-slate-200" />
                 <DropdownMenuItem asChild className="cursor-pointer py-2">
                  <Link href="/ideas/new"><Lightbulb className="mr-2 h-4 w-4 text-amber-500" />아이디어 상세 기획</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2">
                  <Link href="/ideas/batch-rename"><PencilRuler className="mr-2 h-4 w-4 text-amber-500" />상품명 일괄 변경</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild className="cursor-pointer py-2">
                  <Link href="/marketing"><BotMessageSquare className="mr-2 h-4 w-4 text-rose-500" />마케팅 플랜 생성</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <button className="flex items-center transition-colors hover:text-indigo-600 outline-none">
                  워크플로우
                  <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                 <DropdownMenuItem asChild className="cursor-pointer py-2">
                  <Link href="/workflows/auto-product-plan"><Zap className="mr-2 h-4 w-4 text-amber-500" />신상품 자동 기획</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2">
                  <Link href="/upload"><BrainCircuit className="mr-2 h-4 w-4 text-blue-500" />CSV 데이터 분석</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/pricing" className="transition-colors hover:text-indigo-600">요금제</Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-slate-50">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 border-r-4 border-slate-900">
                <div className="p-6 border-b-2 border-slate-900 bg-slate-50">
                   <Link className="flex items-center space-x-2" href="/">
                    <Logo className="h-6 w-6" />
                    <span className="font-bold text-xl tracking-tight">TrendLens AI</span>
                  </Link>
                </div>
                <nav className="flex flex-col p-4 space-y-1">
                   {user && (
                     <>
                      <div className="px-2 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Management</div>
                      <Link className="flex items-center px-2 py-3 rounded-lg hover:bg-slate-50 font-medium" href="/dashboard"><LayoutDashboard className="w-4 h-4 mr-2"/> 대시보드</Link>
                      <Link className="flex items-center px-2 py-3 rounded-lg hover:bg-slate-50 font-medium" href="/milo"><Bot className="w-4 h-4 mr-2 text-indigo-600"/> 마일로 AI</Link>
                      <Link className="flex items-center px-2 py-3 rounded-lg hover:bg-slate-50 font-medium" href="/dashboard/my-documents"><FolderArchive className="w-4 h-4 mr-2"/> 내 문서함</Link>
                      <Link className="flex items-center px-2 py-3 rounded-lg hover:bg-slate-50 font-medium" href="/admin/images"><ImageIcon className="w-4 h-4 mr-2"/> 이미지 갤러리</Link>
                     </>
                   )}
                   <div className="px-2 py-2 mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Tools</div>
                   <Link className="flex items-center px-2 py-3 rounded-lg hover:bg-slate-50 font-medium" href="/trends">AI 트렌드 분석기</Link>
                   <Link className="flex items-center px-2 py-3 rounded-lg hover:bg-slate-50 font-medium" href="/details/studio">상세페이지 스튜디오</Link>
                   <Link className="flex items-center px-2 py-3 rounded-lg hover:bg-slate-50 font-medium" href="/workflows/auto-product-plan">신상품 자동 기획</Link>
                   <div className="px-2 py-2 mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Platform</div>
                   <Link className="flex items-center px-2 py-3 rounded-lg hover:bg-slate-50 font-medium" href="/pricing">요금제</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          
          <nav className="flex items-center gap-3">
            {loading ? (
              <div className="h-10 w-24 animate-pulse rounded-full bg-slate-100" />
            ) : user ? (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-slate-100 overflow-hidden p-0 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <User className="h-5 w-5 text-slate-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <DropdownMenuLabel className="font-bold py-2 px-3">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 border-slate-200" />
                  <DropdownMenuItem asChild className="cursor-pointer py-2">
                    <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4 text-indigo-500" /> 대시보드</Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild className="cursor-pointer py-2">
                    <Link href="/milo"><Bot className="mr-2 h-4 w-4 text-indigo-600" /> 마일로 AI</Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild className="cursor-pointer py-2">
                    <Link href="/dashboard/my-documents"><FolderArchive className="mr-2 h-4 w-4 text-indigo-500" /> 내 문서함</Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild className="cursor-pointer py-2">
                    <Link href="/admin/images"><ImageIcon className="mr-2 h-4 w-4 text-indigo-500" /> 갤러리 관리</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 border-slate-200" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                    <LogOut className="mr-2 h-4 w-4" /> 로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild className="font-semibold text-slate-600 hover:text-indigo-600">
                  <Link href="/login">로그인</Link>
                </Button>
                <Button asChild className="rounded-full px-6 bg-indigo-600 hover:bg-indigo-700 border-2 border-slate-900 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:shadow-none">
                  <Link href="/signup">무료로 시작</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
