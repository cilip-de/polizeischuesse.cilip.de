import { Button, Center, Code, Container, Space, Text } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Case from "../../../components/Case";
import { setupData, setupTaserData } from "../../../lib/data";

const CaseDetail: NextPage = (props) => {
  const clipboard = useClipboard({ timeout: 99999999999999 });

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
        <div style={{ marginTop: "5rem" }}>
          <Link href={props.taser ? "/taser" : "/"}>
            <a>
              <Text align="center">Zur Chronik</Text>
            </a>
          </Link>
          <div style={{ marginTop: "2rem" }}>
            <Case item={props.case} hideLink isTaser={props.taser} />
          </div>
          <Center>
            <Code className="only-non-mobile">{`https://polizeischuesse.cilip.de/fall/${props.id}`}</Code>
            <Space />
            <Button
              size="sm"
              color={"gray"}
              onClick={() =>
                clipboard.copy(
                  `https://polizeischuesse.cilip.de/fall/${props.id}`
                )
              }
            >
              {clipboard.copied ? "Link kopiert" : "Link kopieren"}
            </Button>
          </Center>
          <Space h="xl" />
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
