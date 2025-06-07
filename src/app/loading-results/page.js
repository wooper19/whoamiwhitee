'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image'; // 1. 記得要 import Image 元件

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const score = searchParams.get('score');

  // 您的 useEffect 邏輯完全不變
  useEffect(() => {
    const timer = setTimeout(() => {
      if (score !== null) {
        router.push(`/results?score=${score}`);
      } else {
        router.push('/');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, score]);

  return (
    // 2. 修改 main 元素的樣式，用於設定新的滿版背景
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',

      // --- 新的背景圖片設定 ---
      backgroundImage: "url('/images/bg.png')", // <-- 【重要】請換成您的背景圖路徑
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundSize: 'cover', // 使用 'cover' 讓背景圖填滿畫面
      backgroundAttachment: 'fixed',
    }}>
      {/* 3. 將 wait.png 改為前景的 Image 元件 */}
      <Image
        src="/images/wait.png"
        alt="正在計算結果..."
        width={800}  // 請設定一個基準寬度
        height={600} // 請設定一個基準高度 (請根據您的圖片比例調整)
        style={{
          // 這裡的樣式是為了模擬之前 backgroundSize: 'contain' 的效果
          width: '80vw', // 寬度佔視窗的 80%
          height: 'auto', // 高度自動以保持比例
          maxWidth: '800px' // 設定最大寬度，避免在電腦上過大
        }}
        priority // 建議將主要視覺圖片設為優先加載
      />
    </main>
  );
}

export default function LoadingResultsPage() {
  return (
    // Suspense 的部分也保持不變
    <Suspense fallback={<div>載入中...</div>}>
      <LoadingContent />
    </Suspense>
  );
}