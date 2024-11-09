import "@/styles/globals.css";
import type { AppProps } from "next/app";
// import { createSponsorsTable } from '../lib/db/sponsors';

// // Run this once when setting up your app
// await createSponsorsTable();

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
