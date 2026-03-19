import { MultiSelect } from "@/components/ui/multi-select";
import { TAGS } from "../lib/data";

interface Selection {
  tags: string[];
  [key: string]: any;
}

const CategoryInput = ({
  selection,
  onChange,
}: {
  selection: Selection;
  onChange: (tags: string[]) => void;
}) => {
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
      label="Kategorie"
      placeholder="auswählen (mehrfach)"
      value={selection.tags}
      data={mappedData}
      onChange={onChange}
    />
  );
};

export default CategoryInput;
