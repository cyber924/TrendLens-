
"use client";

import { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Sparkles, ImageIcon, Trash2, Check, Save, FolderCheck, GripVertical } from 'lucide-react';
import { generateProductImage } from '@/ai/flows/generate-product-image-flow';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '@/lib/firebase/client';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


type Variable = { name: string; label: string; placeholder: string };

const templateDetails: Record<string, { title: string; description: string; variables: Variable[] }> = {
  keyVisual: { title: "1. Key Visual (대표 이미지)", description: "시선을 끌고 브랜드 인상을 전달하는 메인 이미지", variables: [ { name: "productName", label: "제품명", placeholder: "프리미엄 실크 블라우스" }, { name: "vibe", label: "분위기 키워드", placeholder: "도시적, 내추럴, 미니멀" } ]},
  closeUp: { title: "2. 제품 특징 (USP 강조)", description: "주요 기능이나 소재를 클로즈업하여 강조", variables: [ { name: "productName", label: "제품명", placeholder: "프리미엄 실크 블라우스" }, { name: "feature", label: "강조할 특징", placeholder: "부드러운 실크 소재의 광택" } ]},
  lifestyle: { title: "3. 사용 장면 (라이프스타일)", description: "제품이 사용되는 일상적인 시나리오 연출", variables: [ { name: "productName", label: "제품명", placeholder: "프리미엄 실크 블라우스" }, { name: "activity", label: "활동", placeholder: "카페에서 커피를 마시는" }, { name: "location", label: "장소", placeholder: "햇살 좋은 카페" } ]},
  flatLay: { title: "4. 구매 정보 / 구성품", description: "세트 구성, 색상 옵션 등을 한 눈에 보여줌", variables: [ { name: "productName", label: "제품명", placeholder: "프리미엄 실크 블라우스" } ]},
  review: { title: "5. SNS 후기형 이미지", description: "실제 사용 후기처럼 보이는 소셜 프루프용 이미지", variables: [ { name: "productName", label: "제품명", placeholder: "프리미엄 실크 블라우스" }, { name: "reviewText", label: "리뷰 텍스트", placeholder: "이 옷 정말 부드럽고 예뻐요!" } ]},
  comparison: { title: "6. 2단 비교 이미지", description: "Before-After 등 제품의 효과를 비교하여 제시", variables: [ { name: "productName", label: "제품명", placeholder: "구김 방지 셔츠" }, { name: "beforeState", label: "Before 상태", placeholder: "구겨진 셔츠" }, { name: "afterState", label: "After 상태", placeholder: "매끈하고 깔끔한 셔츠" } ]},
  icon: { title: "7. 정보 섹션 아이콘", description: "가독성을 높이는 간단한 아이콘/일러스트", variables: [ { name: "iconTopic", label: "아이콘 주제", placeholder: "세탁 방법, 배송" } ]},
};

const imageGenerationTemplates = Object.keys(templateDetails);

type GeneratedImage = {
  id: string;
  template: string;
  url: string;
  prompt: string;
  isSaving?: boolean;
  isSaved?: boolean;
}

export default function ImageStudioPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<string>(imageGenerationTemplates[0]);
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const { toast } = useToast();
    const uniqueId = useId();
    const [user] = useAuthState(auth);

    const handleVariableChange = (name: string, value: string) => {
        setVariables(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        const currentTemplateDetails = templateDetails[selectedTemplate];
        const missingVar = currentTemplateDetails.variables.find(v => !variables[v.name]);
        if (missingVar) {
            toast({ variant: "destructive", title: "입력 필요", description: `'${missingVar.label}' 항목을 입력해주세요.` });
            return;
        }

        setLoading(true);
        try {
            const imageUrl = await generateProductImage({
                template: selectedTemplate as any,
                variables,
            });

            const newImage: GeneratedImage = {
              id: `img-${Date.now()}`,
              template: selectedTemplate,
              url: imageUrl,
              prompt: JSON.stringify(variables)
            };
            setGeneratedImages(prev => [...prev, newImage]);
            toast({ title: "이미지 생성 완료", description: `${currentTemplateDetails.title} 이미지가 생성되었습니다.` });
        } catch (error: any) {
            console.error("Image generation error:", error);
            toast({ variant: "destructive", title: "생성 실패", description: error.message || "이미지를 생성하는 중 오류가 발생했습니다." });
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteImage = (id: string) => {
        setGeneratedImages(prev => prev.filter(img => img.id !== id));
    };
    
    const handleSaveImage = async (image: GeneratedImage) => {
        if (!user) {
            toast({ variant: "destructive", title: "로그인 필요", description: "이미지를 저장하려면 로그인이 필요합니다." });
            return;
        }

        setGeneratedImages(prev => prev.map(img => img.id === image.id ? { ...img, isSaving: true } : img));

        try {
            const imageName = `${image.template}-${Date.now()}.png`;
            const storagePath = `studio_images/${user.uid}/${imageName}`;
            const storageRef = ref(storage, storagePath);
            
            const uploadResult = await uploadString(storageRef, image.url, 'data_url');
            const downloadURL = await getDownloadURL(uploadResult.ref);

            await addDoc(collection(db, 'studio_images'), {
                userId: user.uid,
                downloadURL,
                storagePath,
                fileName: imageName,
                template: image.template,
                variables: JSON.parse(image.prompt),
                createdAt: serverTimestamp(),
            });

            toast({ title: "이미지 저장 완료", description: "이미지가 스토리지에 성공적으로 저장되었습니다." });
            setGeneratedImages(prev => prev.map(img => img.id === image.id ? { ...img, isSaving: false, isSaved: true } : img));

        } catch (error: any) {
            console.error("Error saving image:", error);
            toast({ variant: "destructive", title: "저장 실패", description: error.message || "이미지 저장 중 오류가 발생했습니다." });
            setGeneratedImages(prev => prev.map(img => img.id === image.id ? { ...img, isSaving: false } : img));
        }
    };
    
    return (
        <div className="w-full">
            {/* Wide Hero Section */}
            <section className="w-full bg-[#f1f4f9] border-b-2 border-slate-200 py-16 mb-12">
                <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 text-indigo-700 text-[10px] font-black mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest animate-in slide-in-from-top-4 duration-500">
                            <ImageIcon className="h-3.5 w-3.5" /> High-Resolution Asset Maker
                        </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 uppercase leading-none">
                        AI <span className="text-indigo-600">상세 이미지</span> 스튜디오
                    </h1>
                    <p className="mt-4 text-[11px] md:text-xs font-bold text-slate-400 max-w-xl mx-auto leading-relaxed tracking-tight">
                        상세페이지의 각 섹션 목적에 딱 맞는 <span className="text-slate-900 font-black">7가지 템플릿</span>을 활용하세요. <br />
                        직접 촬영한 사진이 없어도 AI가 고퀄리티 <span className="text-indigo-600">모델 착용 컷과 연출 컷</span>을 즉시 생성해 드립니다.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-6 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
                            <CardHeader>
                                <CardTitle>1. 이미지 타입 선택</CardTitle>
                                <CardDescription className="font-medium">생성할 이미지의 용도를 선택하세요.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-2">
                            {imageGenerationTemplates.map(templateKey => (
                                <Button 
                                key={templateKey} 
                                variant={selectedTemplate === templateKey ? 'default' : 'outline'}
                                onClick={() => { setSelectedTemplate(templateKey); setVariables({}); }}
                                className={cn(
                                    "h-auto py-2 whitespace-normal font-bold border-2 border-slate-900",
                                    selectedTemplate === templateKey ? "bg-slate-900 text-white" : "bg-white text-slate-900 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                )}
                                >
                                {templateDetails[templateKey].title.split('. ')[1]}
                                </Button>
                            ))}
                            </CardContent>
                        </Card>
                        <Card className="sticky top-20 border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
                            <CardHeader>
                                <CardTitle>2. 세부 정보 입력</CardTitle>
                                <CardDescription className="font-medium">{templateDetails[selectedTemplate].description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {templateDetails[selectedTemplate].variables.map(v => (
                                    <div key={v.name} className="space-y-1">
                                        <Label htmlFor={`${uniqueId}-${v.name}`} className="font-bold text-slate-700">{v.label}</Label>
                                        <Input
                                            id={`${uniqueId}-${v.name}`}
                                            value={variables[v.name] || ''}
                                            onChange={(e) => handleVariableChange(v.name, e.target.value)}
                                            placeholder={v.placeholder}
                                            className="border-2 border-slate-200 focus:border-slate-900"
                                        />
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleGenerate} disabled={loading} className="w-full h-11 font-black bg-indigo-600 hover:bg-indigo-700 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    이미지 생성
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                    
                    <div className="lg:col-span-2">
                        <Card className="border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                            <CardHeader className="bg-slate-50 border-b-2 border-slate-900">
                                <CardTitle>AI 생성 이미지 보관함</CardTitle>
                                <CardDescription className="font-medium">생성된 이미지 목록입니다. 이미지를 저장하여 영구 보관할 수 있습니다.</CardDescription>
                            </CardHeader>
                            <CardContent className="min-h-[400px] pt-8">
                                {generatedImages.length > 0 ? (
                                    <div className="space-y-4">
                                        {generatedImages.map((image) => (
                                            <div
                                                key={image.id}
                                                className="p-3 border-2 border-slate-900 rounded-xl bg-white flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                            >
                                                <div className="relative w-24 h-24 flex-shrink-0 border-2 border-slate-900 rounded-lg overflow-hidden">
                                                    <Image src={image.url} alt={`Generated ${image.template}`} fill sizes="96px" className="object-cover" />
                                                </div>
                                                <div className="flex-grow">
                                                    <Badge className="border-2 border-slate-900 bg-indigo-50 text-indigo-700 font-bold">{templateDetails[image.template].title.split('. ')[1]}</Badge>
                                                    <p className="text-xs text-slate-500 font-bold mt-2 line-clamp-2">
                                                        {Object.entries(JSON.parse(image.prompt)).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button size="icon" variant="ghost" className="border-2 border-slate-900 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onClick={() => handleSaveImage(image)} disabled={image.isSaving || image.isSaved}>
                                                        {image.isSaving ? <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> : image.isSaved ? <FolderCheck className="h-4 w-4 text-emerald-600" /> : <Save className="h-4 w-4" />}
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="border-2 border-slate-900 bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onClick={() => handleDeleteImage(image.id)} disabled={image.isSaving}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-300 py-24 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-2xl">
                                        <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
                                        <p className="text-lg font-black text-slate-900">생성된 이미지가 여기에 표시됩니다.</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-end bg-slate-50 border-t-2 border-slate-900 py-4">
                                <Button disabled={generatedImages.length === 0} className="font-black border-2 border-slate-900 bg-slate-900 text-white hover:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <Check className="mr-2 h-4 w-4" />
                                    선택된 이미지로 페이지 구성 (구현 예정)
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
