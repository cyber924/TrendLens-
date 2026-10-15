import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

async function ensureFontsAndImagesLoaded(element: HTMLElement) {
  // 폰트 로드 대기
  await document.fonts.ready;
  
  // 이미지 로드 대기
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map(img => 
      img.complete 
        ? Promise.resolve() 
        : new Promise((res) => {
            img.onload = res;
            img.onerror = res;
            // 5초 후에는 강제 진행 (무한 대기 방지)
            setTimeout(res, 5000);
          })
    )
  );
}

// 캡처용 프록시 주소 변환 (데이터 URI나 로컬 주소는 제외)
const getProxiedUrl = (url: string) => {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith('data:')) return url;
    if (url.includes('dummyimage.com') || url.includes('placehold.co')) return url;
    return `/api/proxy?url=${encodeURIComponent(url)}`;
};

// 특정 엘리먼트를 캡처용 클론으로 만들고 이미지 주소 변환
async function prepareCloneForCapture(originalElement: HTMLElement): Promise<HTMLElement> {
    const clone = originalElement.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = '860px'; // 고정폭 유지
    document.body.appendChild(clone);

    const images = Array.from(clone.querySelectorAll('img'));
    for (const img of images) {
        const src = img.getAttribute('src');
        if (src) {
            img.src = getProxiedUrl(src);
            // 캡처를 위해 crossOrigin 설정
            img.crossOrigin = 'anonymous';
        }
    }
    
    await ensureFontsAndImagesLoaded(clone);
    return clone;
}

// 단일 페이지를 PNG로 변환
export async function pageToPng(pageElement: HTMLElement): Promise<Blob> {
  const clone = await prepareCloneForCapture(pageElement);
  
  const canvas = await html2canvas(clone, {
    backgroundColor: '#fafaf7',
    scale: 2,           // 고화질 (Retina 대응)
    useCORS: true,      // 외부 이미지 허용
    allowTaint: false,
    logging: false,
    width: 860,
    windowWidth: 860,
  });
  
  document.body.removeChild(clone);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png', 0.95);
  });
}

// 단일 페이지 다운로드
export async function downloadSinglePage(pageNum: number, productName: string) {
  const element = document.getElementById(`detail-page-${pageNum}`);
  if (!element) {
    throw new Error(`Page ${pageNum} not found`);
  }
  
  const blob = await pageToPng(element);
  const safeName = productName.replace(/[/\\?%*:|"<>]/g, '-');
  const fileName = `${safeName}_상세페이지_${String(pageNum).padStart(2, '0')}.png`;
  saveAs(blob, fileName);
}

// 모든 페이지를 ZIP으로 일괄 다운로드
export async function downloadAllPages(totalPages: number, productName: string) {
  const zip = new JSZip();
  const safeName = productName.replace(/[/\\?%*:|"<>]/g, '-');
  
  for (let i = 1; i <= totalPages; i++) {
    const element = document.getElementById(`detail-page-${i}`);
    if (!element) continue;
    
    const blob = await pageToPng(element);
    const fileName = `${String(i).padStart(2, '0')}_${safeName}.png`;
    zip.file(fileName, blob);
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${safeName}_상세페이지_전체.zip`);
}

// 모든 페이지를 하나의 긴 이미지로 합쳐서 다운로드
export async function downloadCombinedImage(totalPages: number, productName: string) {
  const pageCanvases: HTMLCanvasElement[] = [];
  let totalHeight = 0;
  const PAGE_WIDTH = 860 * 2; // scale 2 적용
  const safeName = productName.replace(/[/\\?%*:|"<>]/g, '-');
  
  for (let i = 1; i <= totalPages; i++) {
    const element = document.getElementById(`detail-page-${i}`);
    if (!element) continue;
    
    const clone = await prepareCloneForCapture(element);
    const canvas = await html2canvas(clone, {
      backgroundColor: '#fafaf7',
      scale: 2,
      useCORS: true,
      width: 860,
      windowWidth: 860,
    });
    
    pageCanvases.push(canvas);
    totalHeight += canvas.height;
    document.body.removeChild(clone);
  }
  
  const combined = document.createElement('canvas');
  combined.width = PAGE_WIDTH;
  combined.height = totalHeight;
  const ctx = combined.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');
  
  let yOffset = 0;
  for (const canvas of pageCanvases) {
    ctx.drawImage(canvas, 0, yOffset);
    yOffset += canvas.height;
  }
  
  combined.toBlob((blob) => {
    if (blob) {
      saveAs(blob, `${safeName}_상세페이지_전체합본.png`);
    }
  }, 'image/png', 0.95);
}