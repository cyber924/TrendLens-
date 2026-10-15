
"use client";

import * as React from "react";
import { doc, onSnapshot, updateDoc, Timestamp, DocumentData, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth, storage } from "@/lib/firebase/client";
import { useParams, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { Loader2, ArrowLeft, Save, Images, Type, ImagePlus, X, Wand2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { EditableReport } from "@/components/reports/EditableReport";
import { Input } from "@/components/ui/input";
import { marked } from "marked";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

// Premium Page Components
import { PageWrapper } from '@/components/detail-pages/PageWrapper';
import { Page1Hero } from '@/components/detail-pages/Page1Hero';
import { Page2Problem } from '@/components/detail-pages/Page2Problem';
import { Page4Detail } from '@/components/detail-pages/Page4Detail';
import { Page8CTA } from '@/components/detail-pages/Page8CTA';
import type { DetailPageContent } from '@/lib/detail-page/schema';
import { generateProductImage } from "@/ai/flows/generate-product-image-flow";


type ReportDocument = {
  id: string;
  title: string; 
  report: string; // HTML content
  createdAt: Timestamp;
  createdBy: string;
  content?: DetailPageContent; // Added for Premium
};

const collectionMap: Record<string, { name: string, titleField: string, contentField: string }> = {
    'marketing_plans': { name: 'marketing_plans', titleField: 'productName', contentField: 'report' },
    'persona_reports': { name: 'persona_reports', titleField: 'persona', contentField: 'report' },
    'insight_reports': { name: 'insight_reports', titleField: 'query', contentField: 'report' },
    'product_data_reports': { name: 'product_data_reports', titleField: 'title', contentField: 'report' },
    'structured_pages': { name: 'structured_pages', titleField: 'productInfo', contentField: 'htmlContent' },
    'automated_plans': { name: 'automated_plans', titleField: 'keyword', contentField: 'report' },
    'trend_reports': { name: 'trend_reports', titleField: 'title', contentField: 'fullResult' },
};


export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  
  const [loading, setLoading] = React.useState(true);
  const [document, setDocument] = React.useState<ReportDocument | null>(null);
  
  const [editedTitle, setEditedTitle] = React.useState("");
  const [editedReportHtml, setEditedReportHtml] = React.useState("");
  const [editedContent, setEditedContent] = React.useState<DetailPageContent | null>(null);
  
  const [isSaving, setIsSaving] = React.useState(false);
  const [isGeneratingAiImage, setIsGeneratingAiImage] = React.useState(false);
  const [editMode, setEditMode] = React.useState<'text' | 'image'>('text'); 
  
  // Image Replacement States for Premium
  const [isReplacing, setIsReplacing] = React.useState(false);
  const [replaceIndex, setReplaceIndex] = React.useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = React.useState("");

  const docCollectionType = React.useMemo(() => id?.split('_').slice(0, -1).join('_'), [id]);
  const docId = React.useMemo(() => id?.split('_').pop(), [id]);

  React.useEffect(() => {
    if (!docId || !docCollectionType || !collectionMap[docCollectionType]) {
        if (!loading && id) {
             toast({ variant: "destructive", title: "오류", description: "편집할 수 없는 문서 타입입니다." });
             setLoading(false);
        }
        return;
    }

    const collectionInfo = collectionMap[docCollectionType];
    const docRef = doc(db, collectionInfo.name, docId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DocumentData;
        
        if (data.content) {
            const mappedDoc: ReportDocument = {
                id: docSnap.id,
                title: data.productInfo || "프리미엄 상세페이지",
                report: "",
                createdAt: data.createdAt,
                createdBy: data.createdBy,
                content: data.content,
            };
            setDocument(mappedDoc);
            setEditedTitle(mappedDoc.title);
            setEditedContent(data.content);
            setEditMode('image');
        } else {
            let originalContent = data[collectionInfo.contentField] || "";
            
            if (typeof originalContent === 'object' && originalContent !== null) {
              const reportTitle = data[collectionInfo.titleField] || "복합 데이터 리포트";
              const content = JSON.stringify(originalContent, null, 2);
              originalContent = `## ${reportTitle}\n\n\`\`\`json\n${content}\n\`\`\``;
            }

            const isMarkdown = !String(originalContent).trim().startsWith('<') && !String(originalContent).includes('</');
            const htmlContent = isMarkdown 
                ? marked.parse(originalContent, { async: false }) as string
                : originalContent;

            const title = data[collectionInfo.titleField] || data.title || "제목 없음";
            
            const mappedDoc: ReportDocument = {
              id: docSnap.id,
              title: title,
              report: htmlContent,
              createdAt: data.createdAt,
              createdBy: data.createdBy,
            };

            setDocument(mappedDoc);
            setEditedTitle(mappedDoc.title);
            setEditedReportHtml(mappedDoc.report);
        }

      } else {
        toast({ variant: "destructive", title: "오류", description: "해당 문서를 찾을 수 없습니다." });
      }
      setLoading(false);
    }, (error) => {
        console.error("Snapshot error", error);
        toast({ variant: "destructive", title: "데이터 로딩 오류", description: "문서를 불러오는 중 문제가 발생했습니다."});
        setLoading(false);
    });
    return () => unsubscribe();
  }, [docId, docCollectionType, toast, id, loading]);

  const compressImage = async (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    });
  };

  const handleSave = async () => {
    if (!document || !docId || !docCollectionType) return;
    setIsSaving(true);
    try {
        const collectionInfo = collectionMap[docCollectionType];
        const docRef = doc(db, collectionInfo.name, docId);
        const updateData: { [key: string]: any } = {};
        
        if (editedContent) {
            updateData['content'] = JSON.parse(JSON.stringify(editedContent));
            updateData['productInfo'] = editedTitle;
        } else {
            const titleFieldToUpdate = collectionInfo.titleField || 'title';
            updateData[titleFieldToUpdate] = editedTitle;
            updateData[collectionInfo.contentField] = editedReportHtml;
        }
        
        await updateDoc(docRef, updateData);
        toast({ title: "저장 완료" });
        router.push(`/insights/${id}`);
    } catch(error: any) {
        console.error("Error updating document: ", error);
        toast({ variant: "destructive", title: "저장 실패", description: error.message || "문서 업데이트 중 오류가 발생했습니다."});
    } finally {
        setIsSaving(false);
    }
  }

  const premiumImages = React.useMemo(() => {
    if (!editedContent) return [];
    const images: { id: string, type: string, src: string, label: string, update: (val: string) => void }[] = [];
    
    // 사용자 제안: .trim() 로직 적용
    const p1HeroSrc = editedContent.page1.heroImageUrl?.trim() 
        ? editedContent.page1.heroImageUrl 
        : "https://dummyimage.com/860x1075/1a1a1a/666666.png&text=Hero+Image";

    images.push({
        id: 'p1-hero',
        type: 'keyVisual',
        src: p1HeroSrc,
        label: "메인 히어로 이미지 (1P)",
        update: (val: string) => {
            const newContent = { ...editedContent };
            newContent.page1.heroImageUrl = val;
            setEditedContent(newContent);
        }
    });

    if (editedContent.page4) {
        editedContent.page4.details.forEach((d, i) => {
            const detailSrc = d.imageUrl?.trim() 
                ? d.imageUrl 
                : `https://dummyimage.com/430x430/f5f5f5/9ca3af.png&text=Detail+${i+1}`;

            images.push({
                id: `p4-detail-${i}`,
                type: 'closeUp',
                src: detailSrc,
                label: `디테일 이미지 ${i+1} (3P)`,
                update: (val: string) => {
                    const newContent = JSON.parse(JSON.stringify(editedContent));
                    newContent.page4.details[i].imageUrl = val;
                    setEditedContent(newContent);
                }
            });
        });
        
        const highlightSrc = editedContent.page4.highlight.imageUrl?.trim() 
            ? editedContent.page4.highlight.imageUrl 
            : "https://dummyimage.com/400x533/e5e5e5/9ca3af.png&text=Highlight";

        images.push({
            id: 'p4-highlight',
            type: 'lifestyle',
            src: highlightSrc,
            label: "하이라이트 이미지 (3P)",
            update: (val: string) => {
                const newContent = JSON.parse(JSON.stringify(editedContent));
                newContent.page4.highlight.imageUrl = val;
                setEditedContent(newContent);
            }
        });
    }
    return images;
  }, [editedContent]);

  const confirmReplace = () => {
    if (replaceIndex === null || !newImageUrl.trim()) return;
    const target = premiumImages[replaceIndex];
    if (target) {
        target.update(newImageUrl);
    }
    cancelReplace();
  };

  const handleAiImageGenerate = async () => {
    if (replaceIndex === null || !editedContent || !user) return;
    const target = premiumImages[replaceIndex];
    
    setIsGeneratingAiImage(true);
    try {
        const variables: Record<string, string> = {
            productName: editedContent.productName,
            vibe: 'minimal, elegant',
            feature: target.label,
            activity: 'using product',
            location: 'modern studio'
        };

        const base64Image = await generateProductImage({ template: target.type as any, variables });
        const compressedImage = await compressImage(base64Image);

        const fileName = `edit_${Date.now()}.jpg`;
        const storagePath = `detail_images/${user.uid}/${fileName}`;
        const storageRef = ref(storage, storagePath);
        await uploadString(storageRef, compressedImage, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);

        // 내 갤러리에 자동 등록
        await addDoc(collection(db, 'studio_images'), {
            userId: user.uid,
            downloadURL,
            storagePath,
            fileName,
            template: target.type,
            variables: variables,
            createdAt: serverTimestamp(),
        });

        setNewImageUrl(downloadURL);
        toast({ title: "AI 이미지 생성 및 갤러리 저장 완료" });
    } catch (error: any) {
        toast({ variant: "destructive", title: "생성 실패", description: error.message });
    } finally {
        setIsGeneratingAiImage(false);
    }
  }

  const cancelReplace = () => {
    setIsReplacing(false);
    setReplaceIndex(null);
    setNewImageUrl("");
  };


  if (loading || authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }
  
  if (!document || (document && user && document.createdBy !== user.uid)) {
     return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-bold">접근 권한 없음</h1>
        <p className="text-muted-foreground mt-2">이 문서를 편집할 권한이 없습니다.</p>
        <Button asChild className="mt-4">
            <Link href="/dashboard/my-documents"><ArrowLeft className="mr-2 h-4 w-4" /> 내 문서로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  const isPremiumPage = !!document.content;

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4 md:px-6">
       <Card>
        <CardHeader className="border-b bg-white rounded-t-lg space-y-4">
           <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-grow">
                   <CardTitle>편집</CardTitle>
                  <Input 
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-xl font-bold tracking-tight font-headline h-auto p-0 border-0 shadow-none focus-visible:ring-0 mt-1"
                  />
              </div>
              <div className="flex items-center gap-2">
                   <Button variant="outline" asChild>
                      <Link href={`/insights/${id}`}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          취소
                      </Link>
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      저장하기
                  </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2 rounded-lg bg-muted p-3">
              <Images className="h-5 w-5 text-muted-foreground"/>
              <Label htmlFor="edit-mode-toggle" className={cn("text-muted-foreground", editMode === 'image' && "font-bold text-primary")}>
                이미지 교체
              </Label>
              <Switch 
                id="edit-mode-toggle" 
                checked={editMode === 'text'} 
                onCheckedChange={(checked) => setEditMode(checked ? 'text' : 'image')} 
                disabled={isPremiumPage && !isPremiumPage}
              />
              <Label htmlFor="edit-mode-toggle" className={cn("text-muted-foreground", editMode === 'text' && "font-bold text-primary")}>
                텍스트 편집
              </Label>
               <Type className="h-5 w-5 text-muted-foreground"/>
            </div>
        </CardHeader>

        <CardContent className="pt-6">
            {isPremiumPage && editMode === 'image' && (
                <div className="mb-8 space-y-4">
                    {isReplacing && replaceIndex !== null ? (
                        <div className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-md border border-yellow-200 dark:border-yellow-800 shadow-sm">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    {premiumImages[replaceIndex].label} 교체
                                </h3>
                                <Button variant="ghost" size="icon" onClick={cancelReplace}><X className="h-4 w-4"/></Button>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-image-url" className="text-sm font-semibold">이미지 URL 직접 입력</Label>
                                        <Input
                                            id="new-image-url"
                                            type="url"
                                            value={newImageUrl}
                                            onChange={(e) => setNewImageUrl(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button 
                                            onClick={handleAiImageGenerate} 
                                            variant="secondary" 
                                            className="w-full gap-2 border-primary/20 hover:bg-primary/10"
                                            disabled={isGeneratingAiImage}
                                        >
                                            {isGeneratingAiImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-primary" />}
                                            AI로 새로운 이미지 생성하기
                                        </Button>
                                        <div className="flex gap-2 pt-2">
                                            <Button onClick={confirmReplace} className="flex-1">확인</Button>
                                            <Button onClick={cancelReplace} variant="outline" className="flex-1">취소</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded border flex items-center justify-center overflow-hidden aspect-video relative">
                                    {newImageUrl ? (
                                        <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <p className="text-xs text-muted-foreground">이미지 미리보기가 여기에 표시됩니다.</p>
                                    )}
                                    {isGeneratingAiImage && (
                                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                            <p className="text-xs font-bold text-primary">AI 이미지 생성 중...</p>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="bg-muted p-4 rounded-md border">
                            <h3 className="text-sm font-medium mb-3">📷 교체할 영역을 선택하세요</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                {premiumImages.map((img, idx) => (
                                    <div key={img.id} className="relative group aspect-square bg-white rounded border overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all shadow-sm" onClick={() => { setIsReplacing(true); setReplaceIndex(idx); setNewImageUrl(img.src); }}>
                                        <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <ImagePlus className="text-white h-6 w-6" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                                            <p className="text-[9px] text-white truncate text-center font-medium">{img.label.split(' (')[0]}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isPremiumPage ? (
                <div className="flex flex-col items-center bg-slate-100 p-8 rounded-lg border-2 border-dashed">
                    <div className="space-y-8 shadow-2xl origin-top">
                        <PageWrapper pageNum={1} pageTotal={4}>
                            <Page1Hero data={editedContent!.page1} productName={editedContent!.productName} productNameEn={editedContent!.productNameEn} season={editedContent!.season} />
                        </PageWrapper>
                        {editedContent!.page2 && (
                            <PageWrapper pageNum={2} pageTotal={4}>
                                <Page2Problem data={editedContent!.page2} />
                            </PageWrapper>
                        )}
                         {editedContent!.page4 && (
                            <PageWrapper pageNum={3} pageTotal={4}>
                                <Page4Detail data={editedContent!.page4} productName={editedContent!.productName} />
                            </PageWrapper>
                        )}
                        {editedContent!.page8 && (
                            <PageWrapper pageNum={4} pageTotal={4}>
                                <Page8CTA data={editedContent!.page8} productName={editedContent!.productName} />
                            </PageWrapper>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-4 sm:p-8 rounded-lg border shadow-sm min-h-[60vh]">
                    <EditableReport
                        html={editedReportHtml}
                        isEditing={editMode === 'text'}
                        onContentChange={setEditedReportHtml}
                    />
                </div>
            )}
        </CardContent>
       </Card>
    </div>
  );
}
