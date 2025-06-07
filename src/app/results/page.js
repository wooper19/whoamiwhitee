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

function ResultsDisplay() {
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get('score') || '0', 10);

  const [resultEndImageSrc, setResultEndImageSrc] = useState('');
  const [bgImageDimensions, setBgImageDimensions] = useState({ naturalWidth: 0, naturalHeight: 0 });
  const [buttonStyles, setButtonStyles] = useState({ opacity: 0 });

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

      {buttonStyles.opacity === 1 && (
        <div style={buttonStyles}>
          <Link href="/" passHref legacyBehavior>
            <a style={{ display: 'block', width: '100%', height: '100%' }}>
              <Image
                src="/images/restartbutton.png"
                alt="重新開始"
                layout="fill"
                objectFit="contain"
              />
            </a>
          </Link>
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