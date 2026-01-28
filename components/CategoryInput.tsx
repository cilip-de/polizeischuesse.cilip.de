import { MultiSelect } from "@mantine/core";
import router from "next/router";
import { TAGS } from "../lib/data";
import { constructUrlWithQ } from "../lib/util";

interface Selection {
  tags: string[];
  [key: string]: any;
}

const CategoryInput = ({
  q,
  selection,
}: {
  q: string;
  selection: Selection;
}) => {
  // Mantine v8 MultiSelect requires clean data with only value and label
  const mappedData = TAGS.map((x) => ({
    label: x[2],
    value: x[0],
  }))
    .concat(
      TAGS.map((x) => ({
        label: x[3],
        value: "no__" + x[0],
      }))
    )
    .filter(
      (x) =>
        !selection.tags.includes(
          x.value.startsWith("no__")
            ? x.value.replace("no__", "")
            : "no__" + x.value
        )
    );

  return (
    <MultiSelect
      clearable
      searchable
      label="Kategorie"
      placeholder="auswählen (mehrfach)"
      value={selection.tags}
      data={mappedData}
      onChange={(x) =>
        router.replace(
          constructUrlWithQ(q, { ...selection, tags: x, p: 1 }),
          undefined,
          { scroll: false }
        )
      }
    ></MultiSelect>
  );
};

export default CategoryInput;
