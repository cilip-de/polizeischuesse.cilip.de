import { Space } from "@mantine/core";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import React from "react";
import Case from "../components/Case";
import Layout from "../components/Layout";
import { setupTaserData } from "../lib/data";

const Taser: NextPage = ({ data }) => {
  return (
    <Layout title="Tod durch Taser" description="Tod durch Taser">
      <div>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iure, laborum,
        fuga iste veniam dolorum corrupti nobis eum blanditiis soluta eius atque
        voluptatum ut iusto officia natus dolorem ea temporibus. Odit.
      </div>
      <Space />
      <div>
        {data.map((x) => (
          <Case item={x} key={x.key} />
        ))}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await setupTaserData();

  return {
    props: {
      data,
    },
  };
};

export default Taser;
