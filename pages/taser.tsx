import { Container, Text, Title } from "@mantine/core";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import Case from "../components/Case";
import { setupTaserData } from "../lib/data";

const Taser: NextPage = ({ data }) => {
  return (
    <div>
      <Head>
        <title>Tod durch Taser</title>
        <meta name="description" content="Tod durch Taser" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Container>
          <Link href="/">
            <a>{"« zurück"}</a>
          </Link>
          <Title order={1}>Tod durch Taser</Title>
          <Text>Tod durch Taser</Text>
          <div>
            {data.map((x) => (
              <Case item={x} key={x.key} />
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await setupTaserData();

  return {
    props: {
      data,
    },
  };
};

export default Taser;
