import type { AppProps, AppType } from "next/app";
import { Analytics } from "@vercel/analytics/react";

import { api } from "../utils/api";

import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default api.withTRPC(MyApp);
