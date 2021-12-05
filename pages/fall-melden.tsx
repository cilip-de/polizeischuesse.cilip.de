import { Button, Space, Textarea } from "@mantine/core";
import type { NextPage } from "next";
import React from "react";
import Layout from "../components/Layout";

const Statistiken: NextPage = ({ data }) => {
  const [wasSent, setWasSent] = React.useState(false);
  const [wasClicked, setWasClicked] = React.useState(false);
  const [error, setError] = React.useState(false);
  const inputEl = React.useRef(null);
  return (
    <Layout
      metaImg="new_case_cover.jpg"
      metaPath="statistik"
      title="Fall melden"
      description="Du hast Hinweise zu neuen oder alten Fälle? Bitte hinterlasse uns eine Nachricht per Kontakt-Formular. Wenn möglich, dann schick uns Links zu Online-Zeitungsmeldungen."
      cover={
        <div>
          <img src="/new_case_cover.jpg" style={{ width: "100%" }} />
        </div>
      }
      otherContent={null}
    >
      {error && (
        <div>Es ist ein Fehler aufgetreten. Bitte schreib uns eine E-Mail.</div>
      )}
      {wasSent && <div>Die Nachricht wurde erfolgreich übermittelt.</div>}
      {!wasSent && (
        <>
          <Textarea
            ref={inputEl}
            placeholder="Deine Nachricht"
            label="Deine Nachricht"
            required
          />
          <Space h="xl" />
          <Button
            disabled={wasClicked}
            onClick={async () => {
              setWasClicked(true);

              const resp = await fetch("/api/contact/", {
                method: "POST",
                body: JSON.stringify({ text: inputEl.current.value }),
              });
              if (resp.ok) setWasSent(true);
              else setError(true);
            }}
            uppercase
            style={{ width: "45%" }}
            color="gray"
            variant="outline"
          >
            Absenden
          </Button>
        </>
      )}
    </Layout>
  );
};

export default Statistiken;
