import { Container, Text } from "@mantine/core";
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import React from "react";
import Case from "../../../components/Case";
import { setupData } from "../../../lib/data";

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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const results = await setupData();
  // // const case = data.filter((x) => x["Fall"] == id)[0];
  // const case = results.data[0];
  // return { props: { case } };
  return { props: { case: results.data[0] } };
};

export default CaseDetail;
