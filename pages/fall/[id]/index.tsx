import {
  Button,
  Center,
  Code,
  Container,
  Group,
  Space,
  Text,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCopy, IconShare } from "@tabler/icons-react"; // Import icons
import dayjs from "dayjs";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Case from "../../../components/Case";
import { setupData, setupTaserData } from "../../../lib/data";

const CaseDetail: NextPage = (props) => {
  const clipboard = useClipboard({ timeout: 99999999999999 });
  const [shareSupported, setShareSupported] = useState(false);

  useEffect(() => {
    // Check if Web Share API is supported
    setShareSupported(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const isTaser = props.taser;
  const pageUrl = `https://polizeischuesse.cilip.de/fall/${props.id}`;

  const handleShare = async () => {
    const title = `${
      isTaser ? "Tod nach Tasereinsatz" : "Tod durch Polizeischuss"
    } am ${props.case.datePrint} in ${props.case.place}`;
    const text = props.case["Szenarium"];

    try {
      await navigator.share({
        title,
        // text,
        url: pageUrl,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const smTitle = `${
    isTaser ? "Tod nach Tasereinsatz" : "Tod durch Polizeischuss"
  } am ${props.case.datePrint} in ${props.case.place}`;

  const longPrintDate = dayjs(props.case.Datum)
    .locale("de")
    .format("DD. MMMM YYYY");

  const ogImage = `https://polizeischuesse.cilip.de/api/og?line1=am ${longPrintDate}&line2=in ${
    props.case.place
  }${
    props.case.state !== props.case.place ? ", " + props.case.state : ""
  }&title=${isTaser ? "Tod nach Tasereinsatz" : "Polizeilicher Todesschuss"}`;

  return (
    <>
      <Head>
        <title>{smTitle}</title>
        <meta name="description" content={props.case["Szenarium"]} />
        <meta property="og:title" content={smTitle} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={ogImage} />
        <meta
          property="og:url"
          content={`https://polizeischuesse.cilip.de/fall/${props.id}`}
        />
        <meta name="twitter:card" content="summary" />
      </Head>
      <Container>
        <div style={{ marginTop: "5rem" }}>
          <Text align="center">
            <Link href={isTaser ? "/taser" : "/"}>
              Zurück zur Chronik mit allen Fällen
            </Link>
          </Text>
          <div style={{ marginTop: "2rem" }}>
            <Case item={props.case} hideLink isTaser={props.taser} />
          </div>
          <Center>
            <Code className="only-non-mobile">{pageUrl}</Code>
            <Space w={"xl"} />
            <Group>
              {shareSupported ? (
                <Button
                  size="sm"
                  color="blue"
                  leftIcon={<IconShare size={16} />}
                  onClick={handleShare}
                >
                  Teilen
                </Button>
              ) : null}
              <Button
                size="sm"
                color={"gray"}
                leftIcon={<IconCopy size={16} />}
                onClick={() => clipboard.copy(pageUrl)}
              >
                {clipboard.copied ? "Link kopiert" : "Link kopieren"}
              </Button>
            </Group>
          </Center>
          <Space h="xl" />
        </div>
        <Text align="center" style={{ marginBottom: "5rem" }}>
          <Link href={isTaser ? "/taser" : "/"}>
            Zurück zur Chronik mit allen Fällen
          </Link>
        </Text>
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

  // 404
  if (casex == null) return { notFound: true };

  return {
    props: { case: casex, taser: query.id?.includes("taser"), id: query.id },
  };
};

export default CaseDetail;
