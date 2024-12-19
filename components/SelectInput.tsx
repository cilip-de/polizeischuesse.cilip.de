import { Select } from "@mantine/core";
import router from "next/router";
import { constructUrl } from "../lib/util";

interface SelectInputProps {
  skey: string;
  label: string;
  selection: { [key: string]: any };
  data: { value: string; label: string }[];
}

const SelectInput = ({ skey, label, selection, data }: SelectInputProps) => {
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
