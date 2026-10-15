
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { collection, query, onSnapshot, doc, deleteDoc, addDoc, serverTimestamp, where } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, auth, storage } from "@/lib/firebase/client";
import { useAuthState } from "react-firebase-hooks/auth";
import { Loader2, UploadCloud, Copy, Trash2, File as FileIcon, FileImage, FileSpreadsheet, ExternalLink, AlertTriangle, ImageIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type UploadTask = {
  id: number;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
};

type UploadedFile = {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: any;
  collectionName: 'uploadedFiles' | 'studio_images';
};

const FileTypeIcon = ({ mimeType, url, name }: { mimeType: string, url: string, name: string }) => {
    if (mimeType.startsWith("image/")) {
        return <Image src={url} alt={name} width={200} height={200} className="object-cover w-full h-full" />;
    }
    if (mimeType === "text/csv" || mimeType === "application/vnd.ms-excel") {
        return <div className="flex flex-col items-center justify-center h-full bg-slate-100 p-2"><FileSpreadsheet className="h-10 w-10 text-indigo-600" /><p className="text-xs text-center mt-2 font-bold truncate w-full">{name}</p></div>;
    }
    return <div className="flex flex-col items-center justify-center h-full bg-slate-100 p-2"><FileIcon className="h-10 w-10 text-slate-400" /><p className="text-xs text-center mt-2 font-bold truncate w-full">{name}</p></div>;
}


export default function StorageManagementPage() {
  const [user, authLoading] = useAuthState(auth);
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [uploadTasks, setUploadTasks] = React.useState<UploadTask[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = React.useState(true);
  const [fileToDelete, setFileToDelete] = React.useState<UploadedFile | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoadingGallery(false);
      return;
    }

    const collectionsToFetch = [
        { name: 'uploadedFiles', ownerField: 'uploadedBy' },
        { name: 'studio_images', ownerField: 'userId' },
    ] as const;

    let unsubscribes: (() => void)[] = [];
    const allFetchedDocs: Record<string, UploadedFile[]> = {};

    collectionsToFetch.forEach(({ name: collectionName, ownerField }) => {
        const q = query(collection(db, collectionName), where(ownerField, "==", user.uid));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const filesFromSnapshot = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || data.fileName || '이름 없음',
                url: data.url || data.downloadURL,
                path: data.path || data.storagePath || '',
                size: data.size || 0,
                mimeType: data.mimeType || (collectionName === 'studio_images' ? 'image/png' : 'application/octet-stream'),
                uploadedBy: data.uploadedBy || data.userId,
                createdAt: data.createdAt,
                collectionName: collectionName
            } as UploadedFile
          });

          allFetchedDocs[collectionName] = filesFromSnapshot;
          
          const combined = Object.values(allFetchedDocs).flat();
          combined.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
          
          setUploadedFiles(combined);
          setIsLoadingGallery(false);
        }, (error) => {
          console.error(`Error fetching ${collectionName}: `, error);
          toast({ variant: "destructive", title: "갤러리 로딩 실패", description: `${collectionName} 목록을 불러오는 중 오류가 발생했습니다.` });
        });
        unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user, authLoading, toast]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "업로드 실패", description: "업로드를 위해서는 로그인이 필요합니다." });
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast({ variant: "destructive", title: "파일 없음", description: "업로드할 파일을 먼저 선택하세요." });
      return;
    }

    setIsUploading(true);
    const initialTasks: UploadTask[] = selectedFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      progress: 0,
      status: "pending",
    }));
    setUploadTasks(initialTasks);

    const uploadPromises = initialTasks.map(task => {
      return new Promise<void>((resolve, reject) => {
        const fileName = `${Date.now()}-${task.file.name}`;
        const filePath = `images/${user.uid}/${fileName}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, task.file);

        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: "uploading", progress } : t));
          },
          (error) => {
            console.error("Upload error:", error);
            setUploadTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: "error", error: error.message } : t));
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              await addDoc(collection(db, "uploadedFiles"), {
                  name: task.file.name,
                  url: downloadURL,
                  path: filePath,
                  size: task.file.size,
                  mimeType: task.file.type || 'application/octet-stream',
                  uploadedBy: user.uid,
                  createdAt: serverTimestamp(),
              });

              setUploadTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: "completed", progress: 100 } : t));
              resolve();
            } catch (dbError) {
              console.error("Firestore error:", dbError);
              setUploadTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: "error", error: "데이터베이스 저장 실패" } : t));
              reject(dbError);
            }
          }
        );
      });
    });

    try {
      await Promise.all(uploadPromises);
      toast({ title: "업로드 완료", description: "모든 파일이 성공적으로 업로드되었습니다." });
    } catch (error) {
      toast({ variant: "destructive", title: "업로드 중 오류 발생", description: "일부 파일 업로드에 실패했습니다." });
    }
    
    setIsUploading(false);
    setSelectedFiles([]);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL 복사됨", description: "클립보드에 파일 주소가 복사되었습니다."});
  }

  const handleDeleteFile = async () => {
    if (!user || !fileToDelete) return;
    
    setIsDeleting(true);
    try {
      if (fileToDelete.path) {
        const fileRef = ref(storage, fileToDelete.path);
        await deleteObject(fileRef).catch(err => {
            console.warn("Storage file delete failed or already missing:", err);
        });
      }
      
      await deleteDoc(doc(db, fileToDelete.collectionName, fileToDelete.id));
      toast({ title: "파일 삭제됨", description: `${fileToDelete.name}이(가) 삭제되었습니다.` });
    } catch (error: any) {
       console.error("Error deleting file: ", error);
       toast({ variant: "destructive", title: "삭제 실패", description: "파일 삭제 중 오류가 발생했습니다."});
    } finally {
        setIsDeleting(false);
        setFileToDelete(null);
    }
  }

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }
  
  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">접근 권한 없음</h1>
        <p className="text-slate-500 font-medium mt-2">파일을 관리하려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Wide Hero Section */}
      <section className="w-full bg-[#f1f4f9] border-b-2 border-slate-200 py-16 mb-12">
          <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 text-indigo-700 text-[10px] font-black mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest animate-in slide-in-from-top-4 duration-500">
                    <ImageIcon className="h-3.5 w-3.5" /> Media Asset Management
                </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                  이미지 <span className="text-indigo-600">갤러리</span> 및 자산 관리
              </h1>
              <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                  AI가 생성한 <span className="text-slate-900">독점 이미지</span>와 직접 업로드한 소스들을 안전하게 보관하세요. <br />
                  <span className="text-indigo-600">고유 URL 복사</span> 기능을 통해 쇼핑몰 상세페이지나 광고 소재로 즉각 활용이 가능합니다.
              </p>
          </div>
      </section>

      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <Card className="lg:col-span-1 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader>
                <CardTitle className="text-xl">새 파일 업로드</CardTitle>
                <CardDescription className="font-medium text-slate-400 text-[10px]">images/ 폴더에 안전하게 저장됩니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Label htmlFor="file-upload" className="w-full border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all hover:border-slate-900">
                <UploadCloud className="h-12 w-12 text-slate-300" />
                <span className="mt-3 text-sm font-bold text-slate-600">클릭하여 파일 선택</span>
                <span className="mt-1 text-xs font-medium text-slate-400">드래그 앤 드롭 가능</span>
                </Label>
                <Input ref={fileInputRef} id="file-upload" type="file" multiple onChange={handleFileSelect} className="sr-only" />
                {selectedFiles.length > 0 && (
                <div className="text-xs font-bold bg-slate-100 p-3 rounded-lg border-2 border-slate-200">
                    <h4 className="mb-2 uppercase tracking-widest text-slate-400 text-[10px]">SELECTED ({selectedFiles.length})</h4>
                    <ul className="space-y-1">
                    {selectedFiles.map(f => <li key={f.name} className="truncate opacity-70">· {f.name}</li>)}
                    </ul>
                </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0} className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                업로드 시작
                </Button>
            </CardFooter>
            </Card>
            
            <Card className="lg:col-span-2 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader>
                <CardTitle className="text-xl">업로드 진행 상태</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[200px]">
                {uploadTasks.length > 0 ? (
                <div className="space-y-5 pt-2">
                    {uploadTasks.map(task => (
                    <div key={task.id} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                        <span className="truncate max-w-[250px] text-slate-600">{task.file.name}</span>
                        <span className={cn(task.status === 'error' ? 'text-rose-600' : 'text-indigo-600')}>{task.status}</span>
                        </div>
                        <Progress value={task.progress} className={cn("h-3 border-2 border-slate-900", task.status === 'error' ? '[&>div]:bg-rose-500' : '[&>div]:bg-indigo-600')} />
                    </div>
                    ))}
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-300 font-bold">
                    <p>대기 중인 업로드 작업이 없습니다.</p>
                </div>
                )}
            </CardContent>
            </Card>
        </div>

        <Card className="border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader className="bg-slate-50 border-b-2 border-slate-900">
            <CardTitle className="text-xl">내 갤러리</CardTitle>
            <CardDescription className="font-medium text-slate-500 text-[10px]">AI가 생성한 이미지와 내가 직접 올린 파일을 한곳에서 관리하세요.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
            {isLoadingGallery ? (
                <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /></div>
            ) : uploadedFiles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {uploadedFiles.map(file => (
                    <div key={file.id} className="group relative aspect-square border-2 border-slate-900 rounded-xl overflow-hidden bg-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
                    <FileTypeIcon mimeType={file.mimeType} url={file.url} name={file.name} />
                    
                    <div className="absolute top-2 right-2 z-10">
                        <Badge className={cn(
                            "text-[8px] px-1.5 py-0 font-black border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                            file.collectionName === 'studio_images' ? 'bg-amber-400 text-slate-900' : 'bg-slate-900 text-white'
                        )}>
                            {file.collectionName === 'studio_images' ? 'AI' : 'FILE'}
                        </Badge>
                    </div>

                    <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button size="icon" variant="ghost" className="bg-white text-slate-900 border-2 border-slate-900 hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onClick={() => handleCopyUrl(file.url)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="bg-white text-slate-900 border-2 border-slate-900 hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" asChild>
                            <a href={file.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                        </Button>
                        <Button size="icon" variant="ghost" className="bg-rose-500 text-white border-2 border-slate-900 hover:bg-rose-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onClick={() => setFileToDelete(file)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center text-slate-300 py-32 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-2xl">
                <FileImage className="h-16 w-16 mb-6 opacity-20" />
                <p className="text-lg font-bold text-slate-400">아직 저장된 파일이 없습니다.</p>
                </div>
            )}
            </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent className="border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-2xl font-black text-rose-600">
              <AlertTriangle className="h-6 w-6" />
              파일을 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 font-bold text-sm leading-relaxed">
              '<strong>{fileToDelete?.name}</strong>' 파일을 삭제합니다.<br />
              이 작업은 취소할 수 없으며, 스토리지와 데이터베이스에서 영구적으로 제거됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel disabled={isDeleting} className="border-2 border-slate-900 font-bold rounded-none h-12 px-6">취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteFile();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white border-2 border-slate-900 font-bold rounded-none h-12 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              확인 후 삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
