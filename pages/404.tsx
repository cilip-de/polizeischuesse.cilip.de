import type { NextPage } from "next";
import Link from "next/link";

const NotFound: NextPage = () => {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Die Seite konnte nicht gefunden werden (404).</h1>

      <Link href="/">Zur Webseite</Link>
    </div>
  );
};

export default NotFound;
