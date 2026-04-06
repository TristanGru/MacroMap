import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="bottom-right"
        offset={16}
        toastOptions={{
          duration: 6000,
          style: {
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "14px",
          },
        }}
      />
    </>
  );
}
