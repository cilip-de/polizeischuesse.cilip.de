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
  // Mantine v8 Select requires clean data with only value and label properties
  const cleanData = (data || []).map(({ value, label }) => ({ value, label }));

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
      data={cleanData}
    />
  );
};

export default SelectInput;
