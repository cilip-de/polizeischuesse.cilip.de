import { Container, Text } from "@mantine/core";
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import React from "react";
import Case from "../../../components/Case";
import { setupData, setupTaserData } from "../../../lib/data";

const CaseDetail: NextPage = (props) => {
  return (
    <Container>
      <div style={{ marginTop: "10rem" }}>
        <Link href="/">
          <a>
            <Text align="center">zurück zur Chronik</Text>
          </a>
        </Link>
        <div style={{ marginTop: "2rem" }}>
          <Case item={props.case} hideLink />
        </div>
      </div>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const results = await setupData();
  const taserData = await setupTaserData();
  const casex = results.data
    .concat(taserData)
    .filter((x) => x["Fall"] == query.id)[0];
  return { props: { case: casex } };
};

export default CaseDetail;
