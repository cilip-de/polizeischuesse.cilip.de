import { GlobalStyles, MantineProvider, NormalizeCSS } from "@mantine/core";
import { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        theme={{
          colorScheme: "light",
        }}
      >
        <NormalizeCSS />
        <GlobalStyles />
        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
}
