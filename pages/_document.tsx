import { Head, Html, Main, NextScript } from "next/document";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";

export default function Document() {
  const tracking = `var _paq = window._paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
      var u="https://matomo.daten.cool/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', '4']);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })()`;

  return (
    <Html lang="de" {...mantineHtmlProps}>
      <Head>
        <ColorSchemeScript />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Polizeiliche Todesschüsse"
          href="/api/feed?type=shootings"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Todesfälle nach Tasereinsatz"
          href="/api/feed?type=taser"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Alle Fälle"
          href="/api/feed?type=all"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: tracking }}
        />
      </body>
    </Html>
  );
}
