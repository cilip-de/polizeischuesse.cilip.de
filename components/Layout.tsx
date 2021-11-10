import { Container, Space, Title } from "@mantine/core";
import Head from "next/head";
import Link from "next/link";
import React from "react";

export default function Layout({ children, title, description }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Space />
        <Link href="/">
          <a>{"« zurück"}</a>
        </Link>
        <Space />
        <Title order={1}>{title}</Title>
        <Space h="sm" />
        <Title order={4}>{description}</Title>
        <Space h="lg" />
        <main>{children}</main>
        <Space h="lg" />
      </Container>
    </>
  );
}
