import { Col, Container, Grid, Space, Text, Title } from "@mantine/core";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import CaseList from "../components/CaseList";
import VisualizationCard from "../components/VisualizationCard";
import { setupData } from "../lib/data";

const Home: NextPage = ({
  data,
  initialSearchedData,
  selection,
  options,
  maxCases,
}) => {
  return (
    <div>
      <Head>
        <title>Polizeiliche Todesschüsse</title>
        <meta name="description" content="Polizeiliche Todesschüsse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Container>
          <Grid>
            <Col span={12} sm={4} style={{ padding: "3rem" }}>
              <img style={{ width: "100%" }} src="/cover_7.jpg" />{" "}
            </Col>
            <Col span={12} sm={8}>
              <div>
                <Space h="xl" />
                <Title order={1}>Polizeiliche Todesschüsse</Title>
                <Space h="xl" />
                <Title order={3}>
                  Seit 1985 wurden mindestens {maxCases} Personen durch die
                  deutsche Polizei erschossen.
                </Title>
                <Space h="xl" />
                <Text size="md">
                  Es gibt offizielle Statistiken, aber eine einzelne Taten. Die
                  Bürgerrechtszeitschfrift CILIP dokumentiert die Taten.
                </Text>
              </div>
            </Col>
          </Grid>

          <Space h="xl" />
          <Grid>
            <Col span={12} sm={8}>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque
                assumenda excepturi atque praesentium est asperiores obcaecati
                recusandae ratione maiores! Quia nostrum eos, obcaecati facere
                natus ducimus dolore! Commodi, ducimus modi?
              </Text>
              <Space h="xl" />
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque
                assumenda excepturi atque praesentium est asperiores obcaecati
                recusandae ratione maiores! Quia nostrum eos, obcaecati facere
                natus ducimus dolore! Commodi, ducimus modi?
              </Text>
              <Space h="xl" />
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque
                assumenda excepturi atque praesentium est asperiores obcaecati
                recusandae ratione maiores! Quia nostrum eos, obcaecati facere
                natus ducimus dolore! Commodi, ducimus modi?
              </Text>
            </Col>
            <Col span={12} sm={4}>
              <VisualizationCard data={options.year} />
            </Col>
          </Grid>

          <Space h="xl" />

          <Title order={2} id="chronik">
            Chronik
          </Title>

          <CaseList
            initialSearchedData={initialSearchedData}
            data={data}
            selection={selection}
            options={options}
            maxCases={maxCases}
          />
        </Container>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const selection = { q: "", p: "1", ...context.query };

  console.log(selection);

  const { q } = selection;
  const { data, options, fuse } = await setupData();

  if (selection.p !== null) selection.p = parseInt(selection.p);
  if (selection.tags && selection.tags !== null)
    selection.tags = selection.tags.split(",");
  else selection.tags = [];

  let initialSearchedData = null;
  if (q && q.length > 2) {
    // use only excact matches with Fuse advanced search options
    initialSearchedData = fuse
      .search("'" + q)
      .map(({ item, matches }) => ({ ...item, matches: matches }));
  }

  return {
    props: {
      data,
      initialSearchedData,
      options,
      selection,
      maxCases: data.length,
    },
  };
};

export default Home;
