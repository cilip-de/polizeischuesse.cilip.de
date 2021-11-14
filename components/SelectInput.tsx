import { Select } from "@mantine/core";
import router from "next/router";
import React from "react";
import { constructUrl } from "../lib/util";

const SelectInput = ({ skey, label, selection, data }) => {
  return (
    <Select
      value={selection[skey] || ""}
      onChange={(x) =>
        router.push(
          constructUrl({ ...selection, [skey]: x, p: 1 }),
          undefined,
          {
            scroll: false,
          }
        )
      }
      label={label}
      placeholder="auswählen"
      searchable
      clearable
      nothingFound="keine Ergebnis"
      data={data}
    />
  );
};

export default SelectInput;
