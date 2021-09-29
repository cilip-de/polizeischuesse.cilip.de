import { AppProps } from "next/app";
import Head from "next/head";
import {
  MantineProvider,
  NormalizeCSS,
  GlobalStyles,
  useStylesCleanup,
  SsrProvider,
} from "@mantine/core";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  useStylesCleanup();

  return (
    <>
      <SsrProvider>
        <Head>
          <title>Mantine next example</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>

        <MantineProvider
          theme={{
            /* Put your mantine theme override here */
            colorScheme: "light",
          }}
        >
          {/* NormalizeCSS and GlobalStyles are optional */}
          <NormalizeCSS />
          <GlobalStyles />
          <Component {...pageProps} />
        </MantineProvider>
      </SsrProvider>
    </>
  );
}
