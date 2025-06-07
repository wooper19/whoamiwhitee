import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    // 1. 主要容器：將背景從顏色改為圖片
    <main
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',

        // --- 主要修改在這裡 ---
        backgroundImage: "url('/images/bg.png')", // <-- 【重要】請將這裡換成您自己的底圖路徑
        backgroundPosition: 'center center', // 讓背景圖置中
        backgroundRepeat: 'no-repeat',       // 讓背景圖不重複
        backgroundSize: 'cover',             // 讓背景圖填滿整個畫面，可能會裁切
        backgroundAttachment: 'fixed',         // 讓背景圖固定，不隨內容滾動
      }}
    >
      {/* --- 以下的黑板和按鈕結構完全不變 --- */}
      <div
        style={{
          position: 'relative',
          width: '70vw',
          maxWidth: '800px',
        }}
      >
        <Image
          src="/images/first.png"
          alt="Who am I Chalkboard"
          width={800}
          height={600}
          style={{
            width: '100%',
            height: 'auto',
          }}
          priority
        />
        <Link
          href="/game"
          style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '30%',
            maxWidth: '220px',
          }}
        >
          <Image
            src="/images/startbutton.png"
            alt="開始遊戲"
            width={300}
            height={100}
            style={{
              cursor: 'pointer',
              width: '100%',
              height: 'auto',
            }}
          />
        </Link>
      </div>
    </main>
  );
}