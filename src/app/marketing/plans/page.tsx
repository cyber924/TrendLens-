
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, collection, onSnapshot, orderBy, query, doc, updateDoc, deleteDoc, Timestamp, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loader2, PlusCircle, Pencil, Trash2, Sailboat } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from "next/link";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type MarketingPlan = {
  id: string;
  productName: string;
  productDescription: string;
  targetAudience: string;
  report: string;
  createdAt: Timestamp;
  createdBy: string;
};

export default function MyMarketingPlansPage() {
  const [user, authLoading] = useAuthState(auth);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [plans, setPlans] = React.useState<MarketingPlan[]>([]);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeletingDialogOpen, setIsDeletingDialogOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<MarketingPlan | null>(null);
  const [editFormData, setEditFormData] = React.useState<Omit<MarketingPlan, 'id' | 'createdAt' | 'createdBy'>>({
      productName: '', productDescription: '', targetAudience: '', report: ''
  });

  React.useEffect(() => {
    if (!user && !authLoading) {
      setIsLoading(false);
      return;
    }
    if (!user) return;

    setIsLoading(true);
    // Firestore 색인 문제 우회를 위해 where 필터만 사용합니다.
    const q = query(
        collection(db, "marketing_plans"), 
        where("createdBy", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketingPlan));
      
      // 데이터를 가져온 후 클라이언트 측에서 정렬합니다.
      fetchedPlans.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

      setPlans(fetchedPlans);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching marketing plans: ", error);
      toast({
        variant: "destructive",
        title: "데이터 로딩 실패",
        description: "마케팅 플랜을 불러오는 중 오류가 발생했습니다. Firestore 색인이 필요할 수 있습니다.",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast, user, authLoading]);

  const handleEditClick = (plan: MarketingPlan) => {
    setSelectedPlan(plan);
    setEditFormData({
      productName: plan.productName,
      productDescription: plan.productDescription,
      targetAudience: plan.targetAudience,
      report: plan.report,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (plan: MarketingPlan) => {
    setSelectedPlan(plan);
    setIsDeletingDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedPlan) return;
    try {
        const planRef = doc(db, "marketing_plans", selectedPlan.id);
        await updateDoc(planRef, editFormData);
        toast({ title: "플랜 업데이트 성공", description: "마케팅 플랜이 성공적으로 수정되었습니다." });
        setIsEditDialogOpen(false);
        setSelectedPlan(null);
    } catch(error) {
        console.error("Error updating plan: ", error);
        toast({ variant: "destructive", title: "업데이트 실패", description: "플랜 수정 중 오류가 발생했습니다." });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPlan) return;
    try {
        await deleteDoc(doc(db, "marketing_plans", selectedPlan.id));
        toast({ title: "플랜 삭제 성공", description: "마케팅 플랜이 삭제되었습니다." });
        setIsDeletingDialogOpen(false);
        setSelectedPlan(null);
    } catch(error) {
        console.error("Error deleting plan: ", error);
        toast({ variant: "destructive", title: "삭제 실패", description: "플랜 삭제 중 오류가 발생했습니다." });
    }
  };


  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-bold">접근 권한 없음</h1>
        <p className="text-muted-foreground mt-2">저장된 마케팅 플랜을 보려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">나의 마케팅 플랜</h1>
            <p className="text-muted-foreground mt-1">
              AI가 생성하고 저장한 마케팅 전략 목록입니다.
            </p>
          </div>
          <Button asChild>
            <Link href="/marketing"><PlusCircle className="mr-2 h-4 w-4" />새 플랜 생성</Link>
          </Button>
        </div>

        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate">{plan.productName}</CardTitle>
                  <CardDescription>
                    생성: {formatDistanceToNow(plan.createdAt.toDate(), { addSuffix: true, locale: ko })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    <span className="font-semibold text-foreground">타겟:</span> {plan.targetAudience}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                   <Button variant="outline" size="sm" onClick={() => handleEditClick(plan)}>
                     <Pencil className="mr-2 h-4 w-4" /> 수정
                   </Button>
                   <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(plan)}>
                     <Trash2 className="mr-2 h-4 w-4" /> 삭제
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-20">
            <CardContent>
              <Sailboat className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="text-xl font-semibold mt-4">저장된 플랜이 없습니다.</h3>
              <p className="text-muted-foreground mt-2">
              '새 플랜 생성' 버튼을 눌러 첫 번째 AI 마케팅 플랜을 만들어보세요.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>마케팅 플랜 수정</DialogTitle>
            <DialogDescription>
              저장된 마케팅 플랜의 내용을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
             <div className="space-y-2">
                <Label htmlFor="productName">제품명</Label>
                <Input id="productName" value={editFormData.productName} onChange={(e) => setEditFormData(p => ({...p, productName: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productDescription">제품 설명</Label>
                <Textarea id="productDescription" value={editFormData.productDescription} onChange={(e) => setEditFormData(p => ({...p, productDescription: e.target.value}))} className="h-24" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">타겟 고객</Label>
                <Textarea id="targetAudience" value={editFormData.targetAudience} onChange={(e) => setEditFormData(p => ({...p, targetAudience: e.target.value}))} className="h-24" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report">AI 생성 리포트 (Markdown)</Label>
                <Textarea id="report" value={editFormData.report} onChange={(e) => setEditFormData(p => ({...p, report: e.target.value}))} className="h-48 font-mono" />
              </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={() => setSelectedPlan(null)}>
                닫기
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveChanges}>변경사항 저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeletingDialogOpen} onOpenChange={setIsDeletingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. '{selectedPlan?.productName}' 플랜이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPlan(null)}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
