'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';

const TOTAL_QUESTIONS = 7;

// --- 您的按鈕設定常數，完全不變 ---
const BUTTON_OFFSET_X_PERCENT_ON_IMAGE = 0.80;
const BUTTON_OFFSET_Y_PERCENT_ON_IMAGE = 0.60;
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
  // 储存主要背景图片的原始尺寸（自然宽度和高度）
  const [bgImageDimensions, setBgImageDimensions] = useState({ naturalWidth: 0, naturalHeight: 0 });
  const [buttonStyles, setButtonStyles] = useState({ opacity: 0 });
  const [externalLinkButtonStyles, setExternalLinkButtonStyles] = useState({ opacity: 0 });

  const containerRef = useRef(null);

  useEffect(() => {
    if (score >= 0 && score <= 2) setResultEndImageSrc("static/images/end1.png");
    else if (score >= 3 && score <= 5) setResultEndImageSrc("static/images/end2.png");
    else if (score >= 6 && score <= TOTAL_QUESTIONS) setResultEndImageSrc("static/images/end3.png");
    else {
      console.error("未知的得分情況: ", score);
      setResultEndImageSrc("/images/bg.png"); // 备用图
    }
  }, [score]);

  const calculateStyles = useCallback(() => {
    // 确保容器和图片尺寸都已加载
    if (!containerRef.current || !bgImageDimensions.naturalWidth || !bgImageDimensions.naturalHeight) {
      setButtonStyles({ opacity: 0 });
      setExternalLinkButtonStyles({ opacity: 0 });
      return;
    }

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const imageNaturalWidth = bgImageDimensions.naturalWidth;
    const imageNaturalHeight = bgImageDimensions.naturalHeight;

    const containerAspectRatio = containerWidth / containerHeight;
    const imageAspectRatio = imageNaturalWidth / imageNaturalHeight;

    let renderedImageWidth, renderedImageHeight, offsetX, offsetY;

    // 根据 'objectFit: contain' 确定背景图片的实际渲染尺寸
    // 这段逻辑确保按钮是相对于图片实际可见区域进行定位的。
    if (imageAspectRatio > containerAspectRatio) {
      // 图片的宽高比大于容器，意味着图片会以容器宽度为限
      renderedImageWidth = containerWidth;
      renderedImageHeight = containerWidth / imageAspectRatio;
      offsetX = 0;
      offsetY = (containerHeight - renderedImageHeight) / 2; // 垂直居中
    } else {
      // 图片的宽高比小于容器，意味着图片会以容器高度为限
      renderedImageHeight = containerHeight;
      renderedImageWidth = containerHeight * imageAspectRatio;
      offsetX = (containerWidth - renderedImageWidth) / 2; // 水平居中
      offsetY = 0;
    }

    // 计算现有重新开始按钮的样式
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
      transform: 'translate(-50%, -50%)', // 将按钮中心点对齐设定好的百分比位置
    });

    // 计算新增加的右下角外部链接按钮的样式
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
      zIndex: 10,
      transition: 'opacity 0.3s ease-in-out',
      transform: 'translate(-50%, -50%)', // 将按钮中心点对齐设定好的百分比位置
    });

  }, [bgImageDimensions]); // 依赖 bgImageDimensions，当图片尺寸加载完成后会重新计算样式

  useEffect(() => {
    calculateStyles(); // 组件挂载时先执行一次
    window.addEventListener('resize', calculateStyles); // 监听窗口大小变化
    return () => window.removeEventListener('resize', calculateStyles); // 组件卸载时移除监听器
  }, [calculateStyles]);

  const mainStyle = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    // 不再使用 backgroundImage CSS 属性，因为我们需要通过 <Image> 组件来获取其自然尺寸
    // 背景图片现在将直接由下面的 <Image> 组件处理。
  };

  return (
    <main style={mainStyle} ref={containerRef}>
      {resultEndImageSrc && (
        <Image
          src={resultEndImageSrc}
          alt="遊戲結果背景"
          layout="fill"
          objectFit="contain" // 这确保图片在容器内完整显示，不被裁剪
          quality={100}
          priority
          // **关键改动：** 当图片加载完成时，获取其自然尺寸
          onLoadingComplete={({ naturalWidth, naturalHeight }) => {
            setBgImageDimensions({ naturalWidth, naturalHeight });
          }}
        />
      )}

      {/* 现有的重新开始按钮 */}
      {buttonStyles.opacity === 1 && (
        <div style={buttonStyles}>
          <Link href="/" style={{ display: 'block', width: '100%', height: '100%' }}>
              <Image
                src="/static/images/restartbutton.png" // 确保路径正确，通常 'public' 目录下的资源以 '/' 开头
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
          <a
            href="https://classroomdaydream.vercel.app/"
            target="_blank" // 在新标签页打开
            rel="noopener noreferrer" // 打开新标签页的最佳实践
            style={{ display: 'block', width: '100%', height: '100%' }}
          >
            <Image
              src="/static/images/homebutton.png" // 确保路径正确
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