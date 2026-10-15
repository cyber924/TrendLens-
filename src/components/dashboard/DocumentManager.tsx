
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, query, where, Timestamp, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loader2, Trash2, FolderArchive, BotMessageSquare, TrendingUp, Lightbulb, Users, BrainCircuit, AppWindow, Zap, Shirt, Apple, Sparkles, Tv } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

type DocumentBase = {
  id: string;
  createdAt: Timestamp;
  createdBy: string;
};

type MarketingPlan = DocumentBase & {
  type: 'marketing_plans';
  productName: string;
  targetAudience: string;
};

type TrendReport = DocumentBase & {
  type: 'trend_reports';
  title: string;
  category: string;
};

type InsightReport = DocumentBase & {
  type: 'insight_reports';
  query: string;
};

type PersonaReport = DocumentBase & {
  type: 'persona_reports';
  persona: string;
  category: string;
}

type ProductDataReport = DocumentBase & {
  type: 'product_data_reports';
  originalData: string;
  report: string;
  title?: string;
}

type StructuredPage = DocumentBase & {
    type: 'structured_pages';
    productInfo: string;
    template: string;
    htmlContent: string;
}

type AutomatedPlan = DocumentBase & {
    type: 'automated_plans';
    keyword: string;
}

type AnyDocument = MarketingPlan | TrendReport | InsightReport | PersonaReport | ProductDataReport | StructuredPage | AutomatedPlan;

const DocumentCard = ({ doc, onDeleteClick }: { doc: AnyDocument, onDeleteClick: (doc: AnyDocument) => void }) => {
    
    const getCategoryInfo = () => {
        if (doc.type !== 'structured_pages') return null;
        const temp = doc.template.toUpperCase();
        if (temp.includes('FASHION') || temp.includes('의류')) return { name: '의류', icon: <Shirt className="h-3 w-3 mr-1" />, color: 'bg-blue-50 text-blue-700' };
        if (temp.includes('FOOD') || temp.includes('식품')) return { name: '식품', icon: <Apple className="h-3 w-3 mr-1" />, color: 'bg-emerald-50 text-emerald-700' };
        if (temp.includes('BEAUTY') || temp.includes('뷰티')) return { name: '뷰티', icon: <Sparkles className="h-3 w-3 mr-1" />, color: 'bg-pink-50 text-pink-700' };
        if (temp.includes('LIVING') || temp.includes('가전')) return { name: '가전', icon: <Tv className="h-3 w-3 mr-1" />, color: 'bg-orange-50 text-orange-700' };
        return { name: '일반', icon: null, color: 'bg-slate-50 text-slate-700' };
    };

    const getTitle = () => {
        switch(doc.type) {
            case 'marketing_plans': return doc.productName;
            case 'trend_reports': return doc.title;
            case 'insight_reports': return doc.query;
            case 'persona_reports': return `페르소나 분석: ${doc.category}`;
            case 'product_data_reports': return doc.title || `데이터 분석 리포트`;
            case 'structured_pages': 
                const cat = getCategoryInfo();
                const prefix = cat ? `[${cat.name}] ` : "";
                return `${prefix}${doc.productInfo.substring(0, 25)}...`;
            case 'automated_plans': return `자동 기획: ${doc.keyword}`;
            default: return "제목 없음";
        }
    }

    const getDescription = () => {
        return `생성: ${formatDistanceToNow(doc.createdAt.toDate(), { addSuffix: true, locale: ko })}`;
    }

     const getSubDescription = () => {
        switch(doc.type) {
            case 'marketing_plans': return `타겟: ${doc.targetAudience}`;
            case 'trend_reports': return `카테고리: ${doc.category}`;
            case 'insight_reports': return `실시간 웹 분석 리포트`;
            case 'persona_reports': return `페르소나: ${doc.persona}`;
            case 'product_data_reports': return `원본 데이터: ${doc.originalData.split('\n')[0]}...`;
            case 'structured_pages': return `${doc.template} 기반 고퀄리티 상세페이지`;
            case 'automated_plans': return '트렌드-상품-마케팅 통합 리포트';
            default: return "";
        }
    }
    
    const getDetailsHref = () => {
        const unifiedId = `${doc.type}_${doc.id}`;
        return `/insights/${unifiedId}`;
    }

    const getEditHref = () => {
        const unifiedId = `${doc.type}_${doc.id}`;
         switch (doc.type) {
            case 'marketing_plans':
            case 'persona_reports':
            case 'insight_reports':
            case 'product_data_reports':
            case 'structured_pages':
            case 'automated_plans':
            case 'trend_reports':
                return `/edit/${unifiedId}`;
            default:
                return null;
        }
    };
    
    const detailsHref = getDetailsHref();
    const editHref = getEditHref();

    const getBadge = () => {
         switch(doc.type) {
            case 'marketing_plans': return <Badge className="border-2 border-slate-900 bg-rose-50 text-rose-700 font-bold"><BotMessageSquare className="mr-1 h-3 w-3"/>마케팅</Badge>;
            case 'trend_reports': return <Badge className="border-2 border-slate-900 bg-indigo-50 text-indigo-700 font-bold"><TrendingUp className="mr-1 h-3 w-3"/>트렌드</Badge>;
            case 'insight_reports': return <Badge className="border-2 border-slate-900 bg-amber-50 text-amber-700 font-bold"><Lightbulb className="mr-1 h-3 w-3"/>인사이트</Badge>;
            case 'persona_reports': return <Badge className="border-2 border-slate-900 bg-emerald-50 text-emerald-700 font-bold"><Users className="mr-1 h-3 w-3"/>페르소나</Badge>;
            case 'product_data_reports': return <Badge className="border-2 border-slate-900 bg-blue-50 text-blue-700 font-bold"><BrainCircuit className="mr-1 h-3 w-3"/>자동 리포트</Badge>;
            case 'structured_pages': 
                const is4P = doc.template.includes('4페이지') || doc.template.includes('스탠다드');
                return (
                    <div className="flex gap-1.5">
                        <Badge className={cn("border-2 border-slate-900 font-black", is4P ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700")}>
                            <AppWindow className="mr-1 h-3 w-3"/>상세 {is4P ? '4P' : '1P'}
                        </Badge>
                        {getCategoryInfo() && (
                            <Badge className={cn("border-2 border-slate-900 font-bold", getCategoryInfo()?.color)}>
                                {getCategoryInfo()?.icon}{getCategoryInfo()?.name}
                            </Badge>
                        )}
                    </div>
                );
            case 'automated_plans': return <Badge className="border-2 border-slate-900 bg-orange-50 text-orange-700 font-bold"><Zap className="mr-1 h-3 w-3"/>자동 기획안</Badge>;
        }
    }

  return (
    <Card className="flex flex-col border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all bg-white overflow-hidden group">
      <CardHeader className="flex-grow pb-2">
          <div className="flex justify-start">{getBadge()}</div>
          <CardTitle className="truncate pt-3 text-lg font-bold text-slate-900">{getTitle()}</CardTitle>
          <CardDescription className="font-medium text-slate-400">{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
         <p className="text-sm text-slate-600 font-medium line-clamp-2 h-10">{getSubDescription()}</p>
      </CardContent>
      <CardFooter className="grid grid-cols-3 gap-2 border-t-2 border-slate-900 bg-slate-50 p-3">
         <Button asChild variant="outline" size="sm" className="w-full border-2 border-slate-900 font-bold hover:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Link href={detailsHref}>상세보기</Link>
         </Button>
         {editHref ? (
            <Button asChild size="sm" className="w-full border-2 border-slate-900 font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Link href={editHref}>편집</Link>
            </Button>
          ) : (
            <Button size="sm" className="w-full border-2 border-slate-900 font-bold opacity-50" disabled>
              편집
            </Button>
          )}
          <Button variant="destructive" size="sm" className="w-full border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:shadow-none" onClick={() => onDeleteClick(doc)}>
            <Trash2 className="h-4 w-4" />
          </Button>
      </CardFooter>
    </Card>
  );
};

export function DocumentManager() {
  const [user, authLoading] = useAuthState(auth);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [documents, setDocuments] = React.useState<AnyDocument[]>([]);
  const [docToDelete, setDocToDelete] = React.useState<AnyDocument | null>(null);

  const documentTypes: Array<{ name: string; collectionName: AnyDocument['type'] }> = [
    { name: "마케팅 플랜", collectionName: "marketing_plans" },
    { name: "트렌드 리포트", collectionName: "trend_reports" },
    { name: "인사이트 리포트", collectionName: "insight_reports" },
    { name: "페르소나 리포트", collectionName: "persona_reports" },
    { name: "자동 리포트", collectionName: "product_data_reports" },
    { name: "상세 페이지", collectionName: "structured_pages" },
    { name: "자동 기획안", collectionName: "automated_plans" },
  ];

  React.useEffect(() => {
    if (!user && !authLoading) {
      setIsLoading(false);
      return;
    }
    if (!user) return;

    setIsLoading(true);
    const allDocs: AnyDocument[] = [];
    const unsubscribes: (() => void)[] = [];
    let collectionsLoaded = 0;

    documentTypes.forEach(({ collectionName, name }) => {
        const q = query(
            collection(db, collectionName),
            where("createdBy", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newDocs = snapshot.docs.map(d => ({ ...d.data(), id: d.id, type: collectionName } as AnyDocument));
            
            // Remove old docs of this type and add new ones
            const otherDocs = allDocs.filter(d => d.type !== collectionName);
            allDocs.splice(0, allDocs.length, ...otherDocs, ...newDocs);

            // Sort and update state
            allDocs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
            setDocuments([...allDocs]);
            
            collectionsLoaded++;
            if (collectionsLoaded === documentTypes.length) {
              setIsLoading(false);
            }
        }, (error) => {
            console.error(`Error fetching ${collectionName}: `, error);
            toast({
                variant: "destructive",
                title: "데이터 로딩 실패",
                description: `${name} 문서를 불러오는 중 오류가 발생했습니다.`,
            });
            collectionsLoaded++;
            if (collectionsLoaded === documentTypes.length) {
              setIsLoading(false);
            }
        });
        unsubscribes.push(unsubscribe);
    });

    return () => {
        unsubscribes.forEach(unsub => unsub());
    };
  }, [user, authLoading, toast]);
  
  const handleDeleteClick = (doc: AnyDocument) => {
    setDocToDelete(doc);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      await deleteDoc(doc(db, docToDelete.type, docToDelete.id));
      toast({ title: "문서 삭제 성공" });
    } catch (error) {
       console.error("Error deleting document: ", error);
       toast({ variant: "destructive", title: "삭제 실패", description: "문서 삭제 중 오류가 발생했습니다."});
    } finally {
      setDocToDelete(null);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground font-bold">문서를 보려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  const getFilteredDocs = (type?: AnyDocument['type']) => {
      if (!type) return documents;
      return documents.filter(doc => doc.type === type);
  }
  
  return (
    <>
      <Tabs defaultValue="all">
          <TabsList className="mb-8 flex-wrap h-auto bg-slate-200 border-2 border-slate-900 p-1.5 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold">전체 ({documents.length})</TabsTrigger>
            {documentTypes.map(({ name, collectionName }) => (
                <TabsTrigger key={collectionName} value={collectionName} className="data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold">
                    {name} ({getFilteredDocs(collectionName).length})
                </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="animate-in fade-in-50 duration-500">
              {isLoading ? (
                  <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : getFilteredDocs().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {getFilteredDocs().map(doc => <DocumentCard key={`${doc.type}-${doc.id}`} doc={doc} onDeleteClick={handleDeleteClick} />)}
                  </div>
              ) : (
                  <Card className="text-center py-24 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                      <CardContent>
                      <FolderArchive className="mx-auto h-16 w-16 text-slate-200 mb-6" />
                      <h3 className="text-2xl font-bold text-slate-900">저장된 문서가 없습니다.</h3>
                      <p className="text-slate-500 font-medium mt-2">
                          다양한 AI 기능을 사용하여 첫 문서를 생성하고 저장해보세요.
                      </p>
                      </CardContent>
                  </Card>
              )}
          </TabsContent>

          {documentTypes.map(({ collectionName, name }) => (
              <TabsContent key={collectionName} value={collectionName} className="animate-in fade-in-50 duration-500">
                  {isLoading ? (
                      <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                  ) : getFilteredDocs(collectionName).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {getFilteredDocs(collectionName).map(doc => <DocumentCard key={`${doc.type}-${doc.id}`} doc={doc} onDeleteClick={handleDeleteClick} />)}
                      </div>
                  ) : (
                      <Card className="text-center py-24 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                          <CardContent>
                            <FolderArchive className="mx-auto h-16 w-16 text-slate-200 mb-6" />
                            <h3 className="text-2xl font-bold text-slate-900">저장된 {name}이(가) 없습니다.</h3>
                          </CardContent>
                      </Card>
                  )}
              </TabsContent>
          ))}
      </Tabs>

      {/* Delete Alert Dialog */}
      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent className="border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-rose-600">정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 font-bold">
              이 작업은 되돌릴 수 없습니다. 선택한 문서가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-2 border-slate-900 font-bold rounded-none" onClick={() => setDocToDelete(null)}>취소</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700 text-white border-2 border-slate-900 font-bold rounded-none" onClick={handleConfirmDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
