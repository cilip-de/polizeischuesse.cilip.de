import { Col, Container, Grid, Space, Title } from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";

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
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${hostname}/${metaImg}`} />
        <meta property="og:url" content={`${hostname}/${metaPath}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <a href="#main-content" className="skip-link">
        Zum Hauptinhalt springen
      </a>

      <Container>
        <a
          style={{ display: "none" }}
          rel="me"
          href="https://social.tchncs.de/@cilip"
        >
          Mastodon
        </a>
        <Space />
        <button
          onClick={() => {
            // hotfix
            router.push("/");

            // if there is any page to go back to (otherwise this would close the page)
            // if (window.history.state.idx === 0) router.push("/");
            // else router.back();
          }}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            textDecoration: "underline",
            cursor: "pointer",
            font: "inherit",
            color: "inherit",
          }}
          aria-label="Zurück zur Startseite"
        >
          {"« zurück"}
        </button>
        <Space />

        <Grid>
          <Col span={12} md={4}>
            {cover && cover}
          </Col>
          <Col span={12} md={8}>
            <Title order={1}>{title}</Title>
            <Space h="sm" />
            <Title order={4}>{description}</Title>
            {otherContent}
          </Col>
        </Grid>

        <Space h="lg" />
        <Grid>
          <Col span={4} md={4}></Col>
          <Col span={12} md={fullWidth ? 12 : 8}>
            <main id="main-content">{children}</main>
          </Col>
        </Grid>
        <Space h="lg" />
        {/* Verification */}
      </Container>
    </>
  );
}
