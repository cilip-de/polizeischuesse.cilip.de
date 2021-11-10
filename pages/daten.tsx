import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import React from "react";
import Layout from "../components/Layout";
import { setupData } from "../lib/data";

const Daten: NextPage = ({ data, options }) => {
  return (
    <Layout
      title="Ausführliche Darstelleun zu den Daten"
      description="Woher die Daten kommen, etc."
    >
      <div>Peter</div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const { data, options } = await setupData();

  return {
    props: {
      data,
      options,
    },
  };
};

export default Daten;
