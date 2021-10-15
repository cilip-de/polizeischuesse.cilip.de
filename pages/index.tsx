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
  year,
  place,
  state,
  q,
  p,
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
                <Title order={2}>
                  Seit 1985 wurden mindestens {maxCases} Personen durch die
                  deutsche Polizei erschossen.
                </Title>
                <Space h="xl" />
                <Text size="md">
                  Wir dokumentieren die einzelnen Taten. Die Daten werden von
                  der Innenministerkoferenz erhoben. Die Zeitschrift CILIP
                  dokumentiert diese seit{" "}
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
              <VisualizationCard data={options.years} />
            </Col>
          </Grid>

          <Space h="xl" />

          <CaseList
            initialSearchedData={initialSearchedData}
            data={data}
            year={year}
            place={place}
            state={state}
            q={q || ""}
            p={p === null ? null : parseInt(p)}
            options={options}
            maxCases={maxCases}
          />
        </Container>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { year, place, state, q, p } = context.query;

  const { data, options, fuse } = await setupData();

  let initialSearchedData = null;
  if (q && q.length > 2) {
    initialSearchedData = fuse
      .search("'" + q)
      .map(({ item, matches }) => ({ ...item, matches: matches }));
  }

  return {
    props: {
      data,
      initialSearchedData,
      options,
      year: year || null,
      place: place || null,
      state: state || null,
      q: q || null,
      p: p || null,
      maxCases: data.length,
    },
  };
};

export default Home;
