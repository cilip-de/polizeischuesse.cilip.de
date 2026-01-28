import { SegmentedControl } from "@mantine/core";
import { useRouter } from "next/router";
import { constructUrlWithQ, type Selection } from "../lib/util";

interface SortToggleProps {
  q: string;
  sort: "relevance" | "date";
  selection: Selection;
}

const SortToggle = ({ q, sort, selection }: SortToggleProps) => {
  const router = useRouter();
  const disabled = !q || q.length < 3;

  return (
    <SegmentedControl
      value={disabled ? "date" : sort}
      onChange={(value) =>
        router.push(
          constructUrlWithQ(q, { ...selection, sort: value, p: 1 }),
          undefined,
          { scroll: false }
        )
      }
      data={[
        { label: "Relevanz", value: "relevance" },
        { label: "Datum", value: "date" },
      ]}
      disabled={disabled}
      size="xs"
      fullWidth
    />
  );
};

export default SortToggle;
