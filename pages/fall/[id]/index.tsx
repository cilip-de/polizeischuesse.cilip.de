import { Button } from "@/components/ui/button";
import { useClipboard } from "@/lib/hooks/useClipboard";
import { IconCopy, IconShare } from "@tabler/icons-react"; // Import icons
import dayjs from "dayjs";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Case from "../../../components/Case";
import { setupData, setupTaserData } from "../../../lib/data";
import type { ProcessedDataItem } from "../../../lib/data";

interface CaseDetailProps {
  case: ProcessedDataItem;
  taser: boolean;
  id: string;
}

const CaseDetail: NextPage<CaseDetailProps> = (props) => {
  const clipboard = useClipboard({ timeout: 99999999999999 });
  const [shareSupported, setShareSupported] = useState(false);

  useEffect(() => {
    // Check if Web Share API is supported - intentional for SSR hydration
    setShareSupported(typeof navigator !== "undefined" && !!navigator.share); // eslint-disable-line react-hooks/set-state-in-effect
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

  const ogImage = `https://polizeischuesse.cilip.de/api/og-case.png?line1=am ${longPrintDate}&line2=in ${
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
      <div className="mx-auto w-full max-w-[1140px] px-4">
        <div style={{ marginTop: "5rem" }}>
          <p className="text-center">
            <Link href={isTaser ? "/taser" : "/"}>
              Zurück zur Chronik mit allen Fällen
            </Link>
          </p>
          <div style={{ marginTop: "2rem" }}>
            <Case item={props.case} hideLink isTaser={props.taser} />
          </div>
          <div className="flex items-center justify-center" data-testid="case-detail">
            <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono only-non-mobile">{pageUrl}</code>
            <div className="w-6" />
            <div className="flex items-center gap-2">
              {shareSupported ? (
                <Button size="sm" onClick={handleShare}>
                  <IconShare size={16} className="mr-2" />
                  Teilen
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => clipboard.copy(pageUrl)}
              >
                <IconCopy size={16} className="mr-2" />
                {clipboard.copied ? "Link kopiert" : "Link kopieren"}
              </Button>
            </div>
          </div>
          <div className="h-6" />
        </div>
        <p className="text-center" style={{ marginBottom: "5rem" }}>
          <Link href={isTaser ? "/taser" : "/"}>
            Zurück zur Chronik mit allen Fällen
          </Link>
        </p>
      </div>
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
