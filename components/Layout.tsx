import Head from "next/head";
import Link from "next/link";

import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  cover?: ReactNode;
  metaImg: string;
  metaPath: string;
  fullWidth?: boolean;
  otherContent?: ReactNode;
}

export default function Layout({
  children,
  title,
  description,
  cover,
  metaImg,
  metaPath,
  fullWidth = false,
  otherContent = null,
}: LayoutProps) {
  const hostname = "https://polizeischuesse.cilip.de";

  // Detect if this is an API-generated image or a static file
  const isApiImage = metaImg.startsWith("api/");
  const imageUrl = `${hostname}/${metaImg}`;

  // Determine image type based on file extension or API route
  let imageType = "image/png"; // default for API routes
  if (!isApiImage) {
    if (metaImg.endsWith(".jpg") || metaImg.endsWith(".jpeg") || metaImg.endsWith(".jepg")) {
      imageType = "image/jpeg";
    } else if (metaImg.endsWith(".png")) {
      imageType = "image/png";
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content={imageType} />
        <meta property="og:url" content={`${hostname}/${metaPath}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={imageUrl} />
      </Head>

      <a href="#main-content" className="skip-link">
        Zum Hauptinhalt springen
      </a>

      <div className="mx-auto w-full max-w-[1140px] px-4">
        <a className="hidden" rel="me" href="https://social.tchncs.de/@cilip">
          Mastodon
        </a>
        <div className="h-2.5" />
        <Link
          href="/"
          className="underline text-inherit"
          aria-label="Zurück zur Startseite"
        >
          {"« zurück"}
        </Link>
        <div className="h-2.5" />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4">
            {cover && cover}
          </div>
          <div className="col-span-12 md:col-span-8">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <div className="h-3" />
            <h2 className="text-lg font-semibold">{description}</h2>
            {otherContent}
          </div>
        </div>

        <div className="h-5" />
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4 md:col-span-4"></div>
          <div className={`col-span-12 ${fullWidth ? "md:col-span-12" : "md:col-span-8"}`}>
            <main id="main-content">{children}</main>
          </div>
        </div>
        <div className="h-5" />
      </div>
    </>
  );
}
