import { ClerkProvider } from "@clerk/nextjs";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";
import { Zen_Old_Mincho } from "next/font/google";

const zenOldMincho = Zen_Old_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <ClerkProvider {...pageProps}>
        <Head>
          <title>Tycher來考試</title>
          <meta
            name="description"
            content="Tycher 讓你能夠根據不同主題生成練習題，助你一臂之力。現在就加入我們，讓學習變得更有效率吧！"
          />
          <link rel="icon" href="/favicon.ico" />
          <meta property="og:image" content="https://tycher.io/tycher-og.png" />
          <meta
            property="og:title"
            content="Tycher來考試, 你的知識, 你的考試"
          />
          <meta
            property="og:description"
            content="Tycher 讓你能夠根據不同主題生成練習題，助你一臂之力。現在就加入我們，讓學習變得更有效率吧！"
          />
          <meta property="og:url" content="https://tycher.io" />

          <meta
            property="twitter:image"
            content="https://tycher.io/tycher-og.png"
          />
          <meta
            property="twitter:title"
            content="Tycher來考試, 你的知識, 你的考試"
          />
          <meta
            property="twitter:description"
            content="Tycher 讓你能夠根據不同主題生成練習題，助你一臂之力。現在就加入我們，讓學習變得更有效率吧！"
          />
        </Head>
        <main className={zenOldMincho.className}>
          <Component {...pageProps} />
        </main>
      </ClerkProvider>
      <Analytics />
    </>
  );
};

export default api.withTRPC(MyApp);
