"use client";

import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditableReportProps = {
  html: string;
  isEditing: boolean;
  onContentChange: (html: string) => void;
};

export function EditableReport({
  html,
  isEditing,
  onContentChange,
}: EditableReportProps) {
  const contentEditableRef = React.useRef<HTMLDivElement>(null);
  const [currentHtml, setCurrentHtml] = React.useState(html);
  const [selectedImgIndex, setSelectedImgIndex] = React.useState<number | null>(null);
  const [imageList, setImageList] = React.useState<string[]>([]);
  const [isReplacing, setIsReplacing] = React.useState(false);
  const [replaceIndex, setReplaceIndex] = React.useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = React.useState("");

  React.useEffect(() => {
    setSelectedImgIndex(null);
    if (!isEditing) {
        setIsReplacing(false);
        setReplaceIndex(null);
        setNewImageUrl("");
    }
  }, [isEditing]);
  
  React.useEffect(() => {
    setCurrentHtml(html);
    extractImages(html);
  }, [html]);

  const extractImages = (htmlString: string) => {
    const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
    const images: string[] = [];
    let match;
    
    while ((match = imgRegex.exec(htmlString)) !== null) {
      images.push(match[1]);
    }
    
    setImageList(images);
  };

  const handleContentChange = (evt: ContentEditableEvent) => {
    const newHtml = evt.target.value;
    setCurrentHtml(newHtml);
    onContentChange(newHtml);
    extractImages(newHtml);
  };

  const startReplaceMode = (imageIndex: number) => {
    const currentSrc = imageList[imageIndex];
    setIsReplacing(true);
    setReplaceIndex(imageIndex);
    setNewImageUrl(currentSrc);
  };

  const confirmReplace = () => {
    if (replaceIndex === null || !newImageUrl.trim()) return;
    
    const currentSrc = imageList[replaceIndex];
    
    if (newImageUrl !== currentSrc) {
      const imgRegex = /<img[^>]*>/gi;
      let count = 0;
      
      const updatedHtml = currentHtml.replace(imgRegex, (match) => {
        if (count === replaceIndex) {
          const newMatch = match.replace(/src=["']([^"']+)["']/i, `src="${newImageUrl}"`);
          count++;
          return newMatch;
        }
        count++;
        return match;
      });
      
      setCurrentHtml(updatedHtml);
      onContentChange(updatedHtml);
      extractImages(updatedHtml);
    }
    
    cancelReplace();
  };

  const cancelReplace = () => {
    setIsReplacing(false);
    setReplaceIndex(null);
    setNewImageUrl("");
    setSelectedImgIndex(null);
  };

  return (
    <div className="space-y-4">
      {isReplacing && replaceIndex !== null && (
        <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-sm font-medium mb-3">🔄 이미지 {replaceIndex + 1} URL 교체</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="new-image-url" className="text-sm text-muted-foreground">새로운 이미지 URL:</Label>
              <Input
                id="new-image-url"
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmReplace();
                  else if (e.key === 'Escape') cancelReplace();
                }}
                placeholder="https://example.com/image.jpg"
                autoFocus
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmReplace} size="sm">확인</Button>
              <Button onClick={cancelReplace} variant="outline" size="sm">취소</Button>
            </div>
          </div>
        </div>
      )}

      {!isEditing && !isReplacing && imageList.length > 0 && (
        <div className="bg-muted p-4 rounded-md border">
          <h3 className="text-sm font-medium mb-3">📷 이미지 교체하기</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {imageList.map((src, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-center gap-3 p-2 rounded border cursor-pointer hover:bg-background transition-colors",
                  selectedImgIndex === index && "ring-2 ring-primary bg-background"
                )}
                onClick={() => setSelectedImgIndex(index)}
              >
                <img 
                  src={src} 
                  alt={`이미지 ${index + 1}`}
                  className="w-12 h-12 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzYiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">이미지 {index + 1}</p>
                  <p className="text-xs text-muted-foreground truncate">{src}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    startReplaceMode(index);
                  }}
                >
                  교체
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">
            ✏️ 텍스트 편집 모드: 내용을 자유롭게 수정할 수 있습니다.
          </p>
        </div>
      )}

      {!isEditing && !isReplacing && imageList.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md border">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📷 이 리포트에는 이미지가 없습니다.
          </p>
        </div>
      )}

      <ContentEditable
        innerRef={contentEditableRef as React.RefObject<HTMLDivElement>}
        html={currentHtml}
        onChange={handleContentChange}
        contentEditable={isEditing}
        tagName="div"
        className={cn(
          "prose prose-lg dark:prose-invert max-w-none",
          "prose-img:rounded-lg prose-img:max-w-full prose-img:border",
          isEditing && "focus:outline-none p-2 border-2 border-dashed border-border",
          !isEditing && "p-2"
        )}
      />
    </div>
  );
}
