import { Select } from "@mantine/core";
import router from "next/router";
import React from "react";
import { constructUrl } from "../lib/util";

const SelectInput = ({ key, label, selection, data }) => {
  return (
    <Select
      value={selection[key] || ""}
      onChange={(x) =>
        router.push(constructUrl({ ...selection, [key]: x, p: 1 }), undefined, {
          scroll: false,
        })
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
