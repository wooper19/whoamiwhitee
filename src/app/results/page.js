'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';

const TOTAL_QUESTIONS = 7;

// --- 您的按鈕設定常數，完全不變 ---
const BUTTON_OFFSET_X_PERCENT_ON_IMAGE = 0.71;
const BUTTON_OFFSET_Y_PERCENT_ON_IMAGE = 0.56;
const BUTTON_WIDTH_PERCENT_OF_IMAGE = 0.2;
const RESTART_BUTTON_ASPECT_RATIO = 300 / 100;

// --- 新增的常數用於右下角外部連結按鈕 ---
const EXTERNAL_LINK_BUTTON_OFFSET_X_PERCENT_ON_IMAGE = 0.50; // 調整 X 軸位置 (更靠右)
const EXTERNAL_LINK_BUTTON_OFFSET_Y_PERCENT_ON_IMAGE = 0.90; // 調整 Y 軸位置 (更靠下)
const EXTERNAL_LINK_BUTTON_WIDTH_PERCENT_OF_IMAGE = 0.2; // 調整按鈕寬度
const EXTERNAL_LINK_BUTTON_ASPECT_RATIO = 1; // 假設是正方形按鈕，或者根據您的圖片調整

function ResultsDisplay() {
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get('score') || '0', 10);

  const [resultEndImageSrc, setResultEndImageSrc] = useState('');
  const [bgImageDimensions, setBgImageDimensions] = useState({ naturalWidth: 0, naturalHeight: 0 });
  const [buttonStyles, setButtonStyles] = useState({ opacity: 0 });
  const [externalLinkButtonStyles, setExternalLinkButtonStyles] = useState({ opacity: 0 }); // 新增狀態

  const containerRef = useRef(null);

  // --- 您的所有 hooks 和函式邏輯，完全不變 ---
  useEffect(() => {
    if (score >= 0 && score <= 2) setResultEndImageSrc("/images/end1.png");
    else if (score >= 3 && score <= 5) setResultEndImageSrc("/images/end2.png");
    else if (score >= 6 && score <= TOTAL_QUESTIONS) setResultEndImageSrc("/images/end3.png");
    else {
      console.error("未知的得分情況: ", score);
      setResultEndImageSrc("/images/bg.png");
    }
  }, [score]);

  const calculateStyles = useCallback(() => {
    if (!containerRef.current || !bgImageDimensions.naturalWidth || !bgImageDimensions.naturalHeight) {
      setButtonStyles({ opacity: 0 });
      setExternalLinkButtonStyles({ opacity: 0 }); // 初始化新按鈕樣式
      return;
    }
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const imageNaturalWidth = bgImageDimensions.naturalWidth;
    const imageNaturalHeight = bgImageDimensions.naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;
    const imageAspectRatio = imageNaturalWidth / imageNaturalHeight;
    let renderedImageWidth, renderedImageHeight, offsetX, offsetY;
    if (imageAspectRatio > containerAspectRatio) {
      renderedImageWidth = containerWidth;
      renderedImageHeight = containerWidth / imageAspectRatio;
      offsetX = 0;
      offsetY = (containerHeight - renderedImageHeight) / 2;
    } else {
      renderedImageHeight = containerHeight;
      renderedImageWidth = containerHeight * imageAspectRatio;
      offsetX = (containerWidth - renderedImageWidth) / 2;
      offsetY = 0;
    }

    // 計算現有重新開始按鈕的樣式
    const buttonActualWidth = renderedImageWidth * BUTTON_WIDTH_PERCENT_OF_IMAGE;
    const buttonActualHeight = buttonActualWidth / RESTART_BUTTON_ASPECT_RATIO;
    const buttonLeft = offsetX + (renderedImageWidth * BUTTON_OFFSET_X_PERCENT_ON_IMAGE);
    const buttonTop = offsetY + (renderedImageHeight * BUTTON_OFFSET_Y_PERCENT_ON_IMAGE);
    setButtonStyles({
      position: 'absolute',
      left: `${buttonLeft}px`,
      top: `${buttonTop}px`,
      width: `${buttonActualWidth}px`,
      height: `${buttonActualHeight}px`,
      opacity: 1,
      zIndex: 10,
      transition: 'opacity 0.3s ease-in-out',
    });

    // --- 計算新增加的右下角外部連結按鈕的樣式 ---
    const externalLinkButtonActualWidth = renderedImageWidth * EXTERNAL_LINK_BUTTON_WIDTH_PERCENT_OF_IMAGE;
    const externalLinkButtonActualHeight = externalLinkButtonActualWidth / EXTERNAL_LINK_BUTTON_ASPECT_RATIO;
    const externalLinkButtonLeft = offsetX + (renderedImageWidth * EXTERNAL_LINK_BUTTON_OFFSET_X_PERCENT_ON_IMAGE);
    const externalLinkButtonTop = offsetY + (renderedImageHeight * EXTERNAL_LINK_BUTTON_OFFSET_Y_PERCENT_ON_IMAGE);
    setExternalLinkButtonStyles({
      position: 'absolute',
      left: `${externalLinkButtonLeft}px`,
      top: `${externalLinkButtonTop}px`,
      width: `${externalLinkButtonActualWidth}px`,
      height: `${externalLinkButtonActualHeight}px`,
      opacity: 1,
      zIndex: 10, // 確保在新按鈕之上
      transition: 'opacity 0.3s ease-in-out',
      transform: 'translate(-50%, -50%)', // 將按鈕中心點對齊設定的百分比位置
    });

  }, [bgImageDimensions]);

  useEffect(() => {
    calculateStyles();
    window.addEventListener('resize', calculateStyles);
    return () => window.removeEventListener('resize', calculateStyles);
  }, [calculateStyles]);

  // 【主要修改位置】在 mainStyle 物件中添加背景圖片設定
  const mainStyle = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    
    // --- 新增的背景圖片設定 ---
    backgroundImage: "url('/images/bg.png')", // <-- 請將這裡換成您的背景圖路徑
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
  };

  return (
    // --- 您的 JSX 結構完全不變 ---
    <main style={mainStyle} ref={containerRef}>
      {resultEndImageSrc && (
        <Image
          src={resultEndImageSrc}
          alt="遊戲結果背景"
          layout="fill"
          objectFit="contain"
          quality={100}
          priority
          onLoadingComplete={({ naturalWidth, naturalHeight }) => {
            setBgImageDimensions({ naturalWidth, naturalHeight });
          }}
        />
      )}

      {/* 現有的重新開始按鈕 */}
      {buttonStyles.opacity === 1 && (
        <div style={buttonStyles}>
          {/* 修正後的 Link 用法：移除 passHref 和 legacyBehavior，將 style 移到 Link 本身 */}
          <Link href="/" style={{ display: 'block', width: '100%', height: '100%' }}>
              <Image
                src="/images/restartbutton.png"
                alt="重新開始"
                layout="fill"
                objectFit="contain"
              />
          </Link>
        </div>
      )}

      {/* 新增的右下角外部連結按鈕 */}
      {externalLinkButtonStyles.opacity === 1 && (
        <div style={externalLinkButtonStyles}>
          {/* 使用標準 <a> 標籤進行外部連結，並加上 target="_blank" 打開新分頁 */}
          <a
            href="https://classroomdaydream.vercel.app/" // <-- 將這裡替換成您想要連結的外部網址
            target="_blank"
            rel="noopener noreferrer" // 這是打開新視窗時的最佳實踐
            style={{ display: 'block', width: '100%', height: '100%' }}
          >
            <Image
              src="/images/homebutton.png" // <-- **已修正為 homebutton.png**
              alt="前往外部網站"
              layout="fill"
              objectFit="contain"
            />
          </a>
        </div>
      )}
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{display: 'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>載入結果...</div>}>
      <ResultsDisplay />
    </Suspense>
  );
}