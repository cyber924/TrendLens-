
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Download, TableIcon, Pencil } from 'lucide-react';
import { batchRenameProducts, BatchRenameProductsOutput } from '@/ai/flows/batch-rename-products';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import Papa from 'papaparse';

type ResultItem = {
  originalName: string;
  newName: string;
  keywords: string[];
};

export default function BatchRenamePage() {
  const [productNames, setProductNames] = useState('');
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultItem[] | null>(null);
  const { toast } = useToast();

  const handleResultChange = (index: number, value: string) => {
    if (result) {
      const newResult = [...result];
      newResult[index].newName = value;
      setResult(newResult);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productNames.trim()) {
      toast({ variant: "destructive", title: "입력 오류", description: "상품명을 하나 이상 입력해주세요." });
      return;
    }
    setLoading(true);
    setResult(null);

    const nameList = productNames.split('\n').filter(name => name.trim() !== '');

    try {
      const response = await batchRenameProducts({
        productNames: nameList,
        concept: concept || '고객의 시선을 사로잡는 매력적인 상품명으로 바꿔주세요.',
      });
      setResult(response.renamedProducts);
    } catch (error) {
      console.error("상품명 일괄 변경 오류:", error);
      toast({
        variant: "destructive",
        title: "생성 실패",
        description: "상품명을 변경하는 중 오류가 발생했습니다. 다시 시도해 주세요.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadCsv = () => {
    if (!result) return;
    const csvData = result.map(item => ({
      '변경 전 상품명': item.originalName,
      '변경 후 상품명': item.newName,
      '추천 키워드': item.keywords.join(', '),
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'renamed_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
     toast({ title: "CSV 다운로드 완료", description: "상품명 목록이 성공적으로 다운로드되었습니다."});
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl text-slate-900">AI 상품명 일괄 변경</h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
          상품명 목록을 붙여넣고 변환 컨셉을 알려주세요. AI가 모든 상품명을 새롭게 제안합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="sticky top-20 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>상품명 변환 요청</CardTitle>
                <CardDescription className="font-medium">기존 상품명 리스트를 입력하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productNames" className="font-bold text-slate-700">상품명 목록 (한 줄에 하나씩)</Label>
                  <Textarea
                    id="productNames"
                    placeholder="흰색 반팔 티셔츠&#10;청바지&#10;검정 롱코트"
                    value={productNames}
                    onChange={(e) => setProductNames(e.target.value)}
                    required
                    className="h-40 font-mono text-sm border-2 border-slate-200 focus:border-slate-900"
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="concept" className="font-bold text-slate-700">변환 컨셉 (선택 사항)</Label>
                  <Textarea
                    id="concept"
                    placeholder="예: MZ세대를 겨냥한 유쾌한 느낌으로"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                     className="h-24 border-2 border-slate-200 focus:border-slate-900"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full h-11 font-black bg-indigo-600 hover:bg-indigo-700 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  상품명 생성
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="min-h-full border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b-2 border-slate-900">
              <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>AI 생성 결과</CardTitle>
                    <CardDescription className="font-medium">생성된 상품명을 확인하고 수정하세요.</CardDescription>
                  </div>
                  <Button onClick={handleDownloadCsv} disabled={!result || loading} className="border-2 border-slate-900 font-bold bg-white text-slate-900 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Download className="mr-2 h-4 w-4" />
                    CSV 다운로드
                  </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              {loading && (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                  <p className="font-black text-slate-900">AI가 상품명을 새로 만들고 있습니다...</p>
                </div>
              )}
              {result ? (
                <div className="overflow-x-auto border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow className="border-b-2 border-slate-900">
                                <TableHead className="w-[30%] font-black text-slate-900">변경 전</TableHead>
                                <TableHead className="w-[40%] font-black text-slate-900">AI 추천 (수정 가능)</TableHead>
                                <TableHead className="w-[30%] font-black text-slate-900">추천 키워드</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {result.map((item, index) => (
                                <TableRow key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-medium text-slate-500">{item.originalName}</TableCell>
                                    <TableCell>
                                        <Input 
                                            value={item.newName} 
                                            onChange={(e) => handleResultChange(index, e.target.value)}
                                            className="border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-indigo-600 font-bold text-slate-900"
                                        />
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs font-bold">{item.keywords.join(', ')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
              ) : !loading && (
                <div className="text-center text-slate-300 py-32 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <TableIcon className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-black text-slate-900">AI가 생성한 상품명 목록이 여기에 표시됩니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
