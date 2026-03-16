import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import _ from "lodash";
import router from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { constructUrlWithQ } from "../lib/util";

interface SearchInputProps {
  q: string;
  selection: { p: number; [key: string]: any };
  setSearchedData: (data: any) => void;
  setSearchedQ: (q: string) => void;
}

const SearchInput = ({
  q,
  selection,
  setSearchedData,
  setSearchedQ,
}: SearchInputProps) => {
  const doStuff = useCallback(async (newQ: string) => {
    if (selection.p > 1) {
      router.replace(
        constructUrlWithQ(newQ, {
          ...selection,
          p: 1,
          q: newQ,
        })
      ),
        undefined,
        { scroll: false };
      return;
    }

    router.replace(
      constructUrlWithQ(newQ, {
        ...selection,
        q: newQ,
      }),
      undefined,
      { shallow: true }
    );
    if (newQ === "") {
      setSearchedData(null);
    } else {
      if (newQ.length > 2)
        setSearchedData(await (await fetch("/api/suche?q=" + newQ)).json());
    }
  }, [selection, setSearchedData]);

  const fetchSearch = useMemo(() => _.debounce(doStuff, 500), [doStuff]);

  const searchFunc = async (event: { currentTarget: { value: any } }) => {
    const newQ = event.currentTarget.value;
    setSearchedQ(newQ);
    fetchSearch(newQ);
  };

  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (q.length > 0 && q.length < 3) {
      const timer = setTimeout(() => setShowHint(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowHint(false); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [q]);

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
        value={q}
        placeholder="z. B. Wohnung, Flucht, Rücken, Kopf"
        onChange={searchFunc}
      />
    </div>
  );
};

export default SearchInput;
