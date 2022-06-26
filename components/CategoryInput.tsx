import { MultiSelect } from "@mantine/core";
import router from "next/router";
import { TAGS } from "../lib/data";
import { constructUrlWithQ } from "../lib/util";

const CategoryInput = ({ q, selection }) => {
  return (
    <MultiSelect
      clearable
      label="Kategorie"
      placeholder="auswählen (mehrfach)"
      value={selection.tags}
      data={TAGS.map((x) => ({
        label: x[2],
        value: x[0],
        group: "trifft zu",
      }))
        .concat(
          TAGS.map((x) => ({
            label: x[3],
            value: "no__" + x[0],
            group: "trifft nicht zu",
          }))
        )
        .filter(
          (x) =>
            !selection.tags.includes(
              x.value.startsWith("no__")
                ? x.value.replace("no__", "")
                : "no__" + x.value
            )
        )}
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
