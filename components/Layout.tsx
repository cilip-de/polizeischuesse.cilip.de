import { Col, Container, Grid, Space, Title } from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

export default function Layout({
  children,
  title,
  description,
  cover,
  metaImg,
  metaPath,
  fullWidth = false,
  otherContent = null,
}) {
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

      <Container>
        <Space />
        <a
          href="#"
          onClick={() => {
            // if there is any page to go back to (otherwise this would close the page)
            if (window.history.state.idx === 0) router.push("/");
            else router.back();
          }}
        >
          {"« zurück"}
        </a>
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
            <main>{children}</main>
          </Col>
        </Grid>
        <Space h="lg" />
      </Container>
    </>
  );
}
