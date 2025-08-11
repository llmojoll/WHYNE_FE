import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
  const defaultOGImage = `${VERCEL_URL}/og-image.png`;
  return (
    <Html lang='ko'>
      <Head>
        <link rel='icon' href='/favicon.ico' />
        <meta charSet='UTF-8' />
        <meta name='description' content='와인 리뷰 사이트' />
        <meta property='og:title' content='WINE' />
        <meta property='og:description' content='와인 리뷰 사이트' />
        {/* todo: 배포 후 이미지, url 변경 필요 */}
        <meta property='og:image' content={defaultOGImage} />
        <meta property='og:url' content={VERCEL_URL} />
        <meta property='og:type' content='website' />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script
          id='chatling-config'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `window.chtlConfig = { chatbotId: "${process.env.NEXT_PUBLIC_CHAT_ID}" };`,
          }}
        />
        <Script
          async
          data-id='7771422489'
          id='chtl-script'
          type='text/javascript'
          src='https://chatling.ai/js/embed.js'
          strategy='afterInteractive'
        />
        <Script
          id='lower-chatling-z'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
      const lowerZ = () => {
        document.querySelectorAll('iframe[src*="chatling"]').forEach(e => e.style.zIndex = '50');
        document.querySelectorAll('div[style*="z-index: 2147483647"]').forEach(e => e.style.zIndex = '50');
      };
      lowerZ();
      const obs = new MutationObserver(lowerZ);
      obs.observe(document.body, { childList: true, subtree: true });
    `,
          }}
        />
      </body>
    </Html>
  );
}
