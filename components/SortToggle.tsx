import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
    <ToggleGroup
      type="single"
      value={disabled ? "date" : sort}
      onValueChange={(value) => {
        if (value)
          router.push(
            constructUrlWithQ(q, { ...selection, sort: value, p: 1 }),
            undefined,
            { scroll: false }
          );
      }}
      className="w-full"
      disabled={disabled}
      data-testid="sort-toggle"
    >
      <ToggleGroupItem
        value="relevance"
        className="flex-1 text-xs"
        aria-label="Nach Relevanz sortieren"
      >
        Relevanz
      </ToggleGroupItem>
      <ToggleGroupItem
        value="date"
        className="flex-1 text-xs"
        aria-label="Nach Datum sortieren"
      >
        Datum
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default SortToggle;
