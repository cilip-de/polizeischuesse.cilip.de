import { Container, Text } from "@mantine/core";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import Case from "../../../components/Case";
import { setupData, setupTaserData } from "../../../lib/data";

const CaseDetail: NextPage = (props) => {
  const smTitle = `Polizeilicher Todesschuss am ${props.case.datePrint} in ${props.case.place}`;
  return (
    <>
      <Head>
        <title>{smTitle}</title>
        <meta name="description" content={props.case["Szenarium"]} />
        <meta property="og:title" content={smTitle} />
        <meta property="og:type" content="article" />
        <meta
          property="og:image"
          content="https://polizeischuesse.cilip.de/preview.jpg"
        />
        <meta
          property="og:url"
          content={`https://polizeischuesse.cilip.de/fall/${props.id}`}
        />
        <meta name="twitter:card" content="summary" />
      </Head>
      <Container>
        <div style={{ marginTop: "10rem" }}>
          <Link href={props.taser ? "/taser" : "/"}>
            <a>
              <Text align="center">zurück zur Chronik</Text>
            </a>
          </Link>
          <div style={{ marginTop: "2rem" }}>
            <Case item={props.case} hideLink />
          </div>
        </div>
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const results = await setupData();
  const taserData = await setupTaserData();
  const casex = results.data
    .concat(taserData)
    .filter((x) => x["Fall"] == query.id)[0];
  return {
    props: { case: casex, taser: query.id?.includes("taser"), id: query.id },
  };
};

export default CaseDetail;
