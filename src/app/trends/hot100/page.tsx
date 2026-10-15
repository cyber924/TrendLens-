
"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ShoppingCart, UploadCloud, Star, MessageSquare, Loader2, ChevronDown, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { db, auth } from "@/lib/firebase/client";
import { collection, writeBatch, getDocs, query, orderBy, doc, Timestamp, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";


type Hot100Item = {
  id: string; // Document ID
  rank: number;
  previousRank: number | null;
  rankChange: number | 'new';
  name: string;
  price: number;
  discountPrice: number;
  productUrl: string;
  imageUrl: string;
  mall: string;
  reviews: number;
  rating: number;
  updatedAt: any;
};

const ITEMS_PER_PAGE = 20;

export default function Hot100Page() {
  const [user, authLoading] = useAuthState(auth);
  const [hot100Data, setHot100Data] = React.useState<Hot100Item[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(ITEMS_PER_PAGE);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchHot100Data = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "hot100_items"), orderBy("rank", "asc"));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Hot100Item));
      setHot100Data(items);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "데이터 로딩 실패",
        description: "HOT 100 데이터를 불러오는 중 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchHot100Data();
  }, [fetchHot100Data]);

  const parseCsvLine = (line: string): string[] => {
    const values: string[] = [];
    let current_value = '';
    let in_quotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && i + 1 < line.length && line[i + 1] === '"') {
            current_value += '"';
            i++; 
        } else if (char === '"') {
            in_quotes = !in_quotes;
        } else if (char === ',' && !in_quotes) {
            values.push(current_value);
            current_value = '';
        } else {
            current_value += char;
        }
    }
    values.push(current_value);
    return values;
  };

  const generateIdFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      // Naver Shopping specific ID
      const nvid = params.get('nv_mid');
      if (nvid) return nvid;
      
      // Coupang specific ID
      const itemId = params.get('itemId');
      if (itemId) return itemId;

      // Fallback to pathname hash
      const pathname = urlObj.pathname.replace(/[/.]/g, '');
      return pathname.slice(-20);

    } catch(e) {
      // If URL is invalid, hash the url itself as a fallback
      return url.replace(/[^a-zA-Z0-9]/g, "").slice(-20);
    }
  }

  const cleanAndParseInt = (value: string | undefined): number => {
    if (!value) return 0;
    return parseInt(String(value).replace(/,/g, ''), 10) || 0;
  }


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!user) {
        toast({ variant: "destructive", title: "로그인 필요", description: "데이터를 업로드하려면 로그인이 필요합니다." });
        return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // 1. Fetch existing data
        const hot100Collection = collection(db, "hot100_items");
        const existingDocsSnapshot = await getDocs(hot100Collection);
        const existingDataMap = new Map<string, Hot100Item>();
        existingDocsSnapshot.forEach(doc => {
            const data = doc.data() as Hot100Item;
            existingDataMap.set(doc.id, { ...data, id: doc.id });
        });

        // 2. Parse new CSV
        const text = (e.target?.result as string) || '';
        const cleanText = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
        const lines = cleanText.split(/\r\n|\n/).filter(line => line.trim());

        if (lines.length < 2) throw new Error("CSV 파일에 헤더와 데이터가 모두 필요합니다.");
        
        const headerLine = lines[0];
        const headers = parseCsvLine(headerLine).map(h => h.trim().replace(/"/g, ''));
        
        const requiredHeaders = ['순위', '상품명', '링크', '이미지'];
        if (!requiredHeaders.every(required => headers.includes(required))) {
          throw new Error(`잘못된 CSV 형식입니다. 헤더는 반드시 다음을 포함해야 합니다: ${requiredHeaders.join(', ')}`);
        }
        
        const headerMap: { [key: string]: string } = {
          '순위': 'rank', '상품명': 'name', '가격': 'price', '할인가': 'discountPrice', '링크': 'productUrl', '이미지': 'imageUrl', '쇼핑몰': 'mall', '리뷰수': 'reviews', '평점': 'rating'
        };
        const headerIndexMap: { [key: string]: number } = {};
        headers.forEach((header, index) => {
            const key = headerMap[header.trim()];
            if(key) headerIndexMap[key] = index;
        });

        const newDataSet = new Set<string>();
        const batch = writeBatch(db);

        // 3. Process new data and calculate changes
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i]) continue;
          const values = parseCsvLine(lines[i]);
          if(values.length < headers.length) continue;

          const entry: any = {};
          for (const key in headerIndexMap) {
             const index = headerIndexMap[key];
             if (index !== undefined) entry[key] = values[index] || '';
          }
          
          const newRank = parseInt(entry.rank, 10) || i;
          const productUrl = entry.productUrl || '#';
          const productId = generateIdFromUrl(productUrl);
          
          newDataSet.add(productId);

          const existingProduct = existingDataMap.get(productId);
          const previousRank = existingProduct ? existingProduct.rank : null;
          let rankChange: number | 'new' = 'new';
          
          if(previousRank) {
            rankChange = previousRank - newRank; // positive = up, negative = down
          }

          const newItem: Hot100Item = {
            id: productId,
            rank: newRank,
            previousRank: previousRank,
            rankChange: rankChange,
            name: entry.name || 'N/A',
            price: cleanAndParseInt(entry.price),
            discountPrice: cleanAndParseInt(entry.discountPrice),
            productUrl: productUrl,
            imageUrl: entry.imageUrl || 'https://placehold.co/80x80.png',
            mall: entry.mall || 'N/A',
            reviews: cleanAndParseInt(entry.reviews),
            rating: parseFloat(entry.rating || '0') || 0,
            updatedAt: Timestamp.fromDate(new Date()),
          };
          
          const docRef = doc(hot100Collection, productId);
          batch.set(docRef, newItem);
        }

        // 4. Delete products that are no longer in the top 100
        existingDataMap.forEach((product, id) => {
            if (!newDataSet.has(id)) {
                batch.delete(doc(hot100Collection, id));
            }
        });

        // 5. Commit all changes
        await batch.commit();

        toast({
          title: "업로드 및 순위 분석 완료",
          description: `성공적으로 ${lines.length - 1}개의 상품 순위를 업데이트했습니다.`
        });
        
        await fetchHot100Data();
        setVisibleCount(ITEMS_PER_PAGE);

      } catch (error: any) {
        console.error("CSV 처리 및 저장 오류:", error);
        toast({
          variant: "destructive",
          title: "업로드 실패",
          description: error.message || "파일 처리 또는 저장 중 오류가 발생했습니다."
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };

  const RankChangeIndicator = ({ change }: { change: number | 'new' }) => {
    if (change === 'new') {
        return <Badge className="bg-amber-400 text-slate-900 border-2 border-slate-900 font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">NEW</Badge>;
    }
    if (change > 0) {
        return <div className="flex items-center text-rose-600"><ArrowUp className="h-4 w-4" /><span className="font-bold">{change}</span></div>;
    }
    if (change < 0) {
        return <div className="flex items-center text-indigo-600"><ArrowDown className="h-4 w-4" /><span className="font-bold">{Math.abs(change)}</span></div>;
    }
    return <div className="flex items-center text-slate-400"><Minus className="h-4 w-4" /></div>;
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl text-slate-900">네이버 판매 트렌드 - HOT 100</h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
          현재 네이버 쇼핑에서 가장 인기 있는 상품 순위를 확인하세요.
        </p>
      </div>
      
      <div className="mb-12">
        <Card className="border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <CardHeader>
            <CardTitle>CSV 데이터 업로드</CardTitle>
            <CardDescription>
              '순위,상품명,가격,할인가,링크,이미지,쇼핑몰,리뷰수,평점' 헤더를 포함한 CSV 파일을 업로드하여 순위를 갱신하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading || authLoading} className="font-bold border-2 border-slate-900 bg-slate-50 hover:bg-slate-100 text-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              {isUploading ? "처리 중..." : "CSV 파일 선택 및 업로드"}
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /></div>
      ) : hot100Data.length > 0 ? (
        <div className="space-y-6">
          {hot100Data.slice(0, visibleCount).map((item) => (
            <Card key={item.id} className="overflow-hidden border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 text-center">
                  <span className="text-3xl font-black text-slate-900">{item.rank}</span>
                  <RankChangeIndicator change={item.rankChange} />
                </div>
                
                <Separator orientation="vertical" className="h-auto bg-slate-200" />
                
                <div className="flex-shrink-0 relative w-20 h-20 border-2 border-slate-900 rounded-lg overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/80x80.png'; }}
                  />
                </div>
                
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm leading-snug clamp-2 mb-1">{item.name}</p>
                    <p className="text-xs font-semibold text-slate-400">{item.mall}</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-rose-600">{item.discountPrice.toLocaleString()}원</span>
                    {item.price !== item.discountPrice && <span className="text-xs text-slate-400 font-medium line-through">{item.price.toLocaleString()}원</span>}
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-end justify-between w-[110px]">
                   <div className="flex flex-col items-end gap-1.5">
                      <Badge variant="outline" className="gap-1.5 border-2 border-slate-900 font-bold bg-slate-50">
                        <MessageSquare className="h-3 w-3" />
                        <span className="text-[10px]">{item.reviews.toLocaleString()}</span>
                      </Badge>
                      <Badge variant="outline" className="gap-1.5 border-2 border-slate-900 font-bold bg-amber-50">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px]">{item.rating.toFixed(1)}</span>
                      </Badge>
                   </div>
                    <Button asChild variant="outline" size="sm" className="mt-2 border-2 border-slate-900 font-bold hover:bg-slate-50">
                      <a href={item.productUrl} target="_blank" rel="noopener noreferrer">
                        보러 가기
                        <ArrowUpRight className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {visibleCount < hot100Data.length && (
            <Button onClick={handleLoadMore} variant="outline" className="w-full h-12 border-2 border-slate-900 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50">
              <ChevronDown className="mr-2 h-4 w-4" />
              더보기 ({visibleCount}/{hot100Data.length})
            </Button>
          )}
        </div>
      ) : (
         <Card className="text-center py-24 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardContent>
              <ShoppingCart className="mx-auto h-16 w-16 text-slate-200 mb-6" />
              <h3 className="text-xl font-bold text-slate-900">표시할 데이터가 없습니다.</h3>
              <p className="text-slate-500 mt-2 font-medium">
                CSV 파일을 업로드하여 인기 상품 순위를 확인하세요.
              </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

const style = `
  .clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
`;
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = style;
  document.head.appendChild(styleSheet);
}
