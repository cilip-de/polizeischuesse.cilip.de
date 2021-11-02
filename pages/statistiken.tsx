import { Container, Text, Title } from "@mantine/core";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import { setupData } from "../lib/data";

const Statistiken: NextPage = ({ data, options }) => {
  return (
    <div>
      <Head>
        <title>Polizeiliche Todesschüsse</title>
        <meta name="description" content="Polizeiliche Todesschüsse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Container>
          <Link href="/">
            <a>{"« zurück"}</a>
          </Link>
          <Title order={1}>Offizielle Statistiken</Title>
          <Text>Kurze Beschreibung zum Hintergrund der Statistiken.</Text>
        </Container>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const { data, options } = await setupData();

  return {
    props: {
      data,
      options,
    },
  };
};

export default Statistiken;
