import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import debounce from "lodash/debounce";
import router from "next/router";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { constructUrlWithQ } from "../lib/util";

interface SearchInputProps {
  q: string;
  selection: { p: number; [key: string]: any };
  setSearchedQ: (q: string) => void;
}

const SearchInput = ({
  q,
  selection,
  setSearchedQ,
}: SearchInputProps) => {
  // Local input value — responds immediately to typing
  const [inputValue, setInputValue] = useState(q);
  // Latest query fed to the debounce; also lets us tell our own committed URL
  // changes apart from external ones (back button, links).
  const [debouncedQ, setDebouncedQ] = useState<string | null>(null);

  // Sync the input when the URL's q changes externally, but not when the change
  // is our own committed search. Adjusting state during render (guarded by a
  // changed value) is React's recommended alternative to a syncing Effect.
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    if (q !== debouncedQ) setInputValue(q);
  }

  // Commit the search. As an Effect Event it always sees the latest selection /
  // setSearchedQ without them being reactive dependencies — so the debounce
  // below needs no value refs to stay stable.
  const commitSearch = useEffectEvent((newQ: string) => {
    setSearchedQ(newQ);
    router.replace(
      constructUrlWithQ(newQ, {
        ...selection,
        p: 1,
        q: newQ,
      }),
      undefined,
      { scroll: false, shallow: true }
    );
  });

  // The debounce only defers a state update (no refs), so it stays stable.
  // Effect Events may only be called from an Effect, so commit once q settles.
  const fetchSearch = useMemo(() => debounce(setDebouncedQ, 300), []);
  useEffect(() => () => fetchSearch.cancel(), [fetchSearch]);

  useEffect(() => {
    if (debouncedQ !== null) commitSearch(debouncedQ);
  }, [debouncedQ]);

  const searchFunc = (event: { currentTarget: { value: any } }) => {
    const newQ = event.currentTarget.value;
    setInputValue(newQ);
    fetchSearch(newQ);
  };

  // Show a "min. 3 characters" hint once the input has lingered at 1–2 chars.
  const inHintRange = inputValue.length > 0 && inputValue.length < 3;
  const [hintReady, setHintReady] = useState(false);
  useEffect(() => {
    if (!inHintRange) return;
    const timer = setTimeout(() => setHintReady(true), 2000);
    return () => {
      clearTimeout(timer);
      setHintReady(false);
    };
  }, [inHintRange]);
  const showHint = inHintRange && hintReady;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="search" className="text-sm font-medium">
        {showHint ? (
          <>
            Suche{" "}
            <span style={{ fontWeight: "normal", color: "#868e96" }}>
              – bitte mindestens 3 Zeichen eingeben
            </span>
          </>
        ) : (
          "Suche"
        )}
      </Label>
      <Input
        id="search"
        value={inputValue}
        placeholder="z. B. Wohnung, Flucht, Rücken, Kopf"
        onChange={searchFunc}
      />
    </div>
  );
};

export default SearchInput;
