import { TextInput } from "@mantine/core";
import router from "next/router";
import React from "react";
import { constructUrlWithQ } from "../lib/util";

const SearchInput = ({ q, selection, setSearchedData, setSearchedQ }) => {
  return (
    <TextInput
      value={q}
      style={{ marginBottom: "2rem" }}
      label="Suche"
      placeholder="z. B. Wohnung, Flucht, Rücken, Kopf"
      onChange={async (event) => {
        if (selection.p > 1) {
          router.replace(
            constructUrlWithQ(q, {
              ...selection,
              p: 1,
              q: event.currentTarget.value,
            })
          ),
            undefined,
            { scroll: false };
          return;
        }

        router.replace(
          constructUrlWithQ(q, {
            ...selection,
            q: event.currentTarget.value,
          }),
          undefined,
          { shallow: true }
        );
        setSearchedQ(event.currentTarget.value);
        if (event.currentTarget.value === "") {
          setSearchedData(null);
        } else {
          if (event.currentTarget.value.length > 2)
            setSearchedData(
              await (
                await fetch("/api/suche?q=" + event.currentTarget.value)
              ).json()
            );
        }
      }}
    />
  );
};

export default SearchInput;
