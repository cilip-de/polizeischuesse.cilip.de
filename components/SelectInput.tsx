import { SearchableSelect } from "@/components/ui/searchable-select";
import router from "next/router";
import { constructUrl } from "../lib/util";

interface SelectInputProps {
  skey: string;
  label: string;
  selection: { [key: string]: any };
  data: { value: string; label: string }[];
}

const SelectInput = ({ skey, label, selection, data }: SelectInputProps) => {
  // Safety check: ensure data is an array
  if (!data || !Array.isArray(data)) {
    return (
      <SearchableSelect
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
        clearable
        data={[]}
      />
    );
  }

  const processedData = data.map(({ value, label }) => ({ value, label }));

  return (
    <SearchableSelect
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
      clearable
      data={processedData}
    />
  );
};

export default SelectInput;
