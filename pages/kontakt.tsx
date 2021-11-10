import { Space } from "@mantine/core";
import type { NextPage } from "next";
import React from "react";
import Layout from "../components/Layout";

const Kontakt: NextPage = () => {
  return (
    <Layout
      title="Kontakt, Impressum, Datenschutz"
      description="Wie ihr uns erreichen könnte und andere wichtige Informationen"
    >
      <div>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iure, laborum,
        fuga iste veniam dolorum corrupti nobis eum blanditiis soluta eius atque
        voluptatum ut iusto officia natus dolorem ea temporibus. Odit.
      </div>
      <Space />
      <div>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iure, laborum,
        fuga iste veniam dolorum corrupti nobis eum blanditiis soluta eius atque
        voluptatum ut iusto officia natus dolorem ea temporibus. Odit.
      </div>
    </Layout>
  );
};

export default Kontakt;
