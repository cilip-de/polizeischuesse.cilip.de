import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import _ from "lodash";
import router from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
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
  // Local input value — responds immediately to typing
  const [inputValue, setInputValue] = useState(q);
  const isUserTyping = useRef(false);

  // Refs for latest values so the debounced function stays stable
  const selectionRef = useRef(selection);
  const setSearchedDataRef = useRef(setSearchedData);
  const setSearchedQRef = useRef(setSearchedQ);
  useEffect(() => { selectionRef.current = selection; }, [selection]);
  useEffect(() => { setSearchedDataRef.current = setSearchedData; }, [setSearchedData]);
  useEffect(() => { setSearchedQRef.current = setSearchedQ; }, [setSearchedQ]);

  // Sync from URL when URL changes externally (not from typing)
  useEffect(() => {
    if (!isUserTyping.current) {
      setInputValue(q);
    }
  }, [q]);

  const fetchSearch = useMemo(() => _.debounce(async (newQ: string) => {
    isUserTyping.current = false;
    setSearchedQRef.current(newQ);

    router.replace(
      constructUrlWithQ(newQ, {
        ...selectionRef.current,
        p: 1,
        q: newQ,
      }),
      undefined,
      { scroll: false, shallow: true }
    );

    if (newQ === "") {
      setSearchedDataRef.current(null);
    } else if (newQ.length > 2) {
      setSearchedDataRef.current(await (await fetch("/api/suche?q=" + newQ)).json());
    }
  }, 300), []);

  const searchFunc = (event: { currentTarget: { value: any } }) => {
    const newQ = event.currentTarget.value;
    isUserTyping.current = true;
    setInputValue(newQ);
    fetchSearch(newQ);
  };

  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (inputValue.length > 0 && inputValue.length < 3) {
      const timer = setTimeout(() => setShowHint(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowHint(false); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [inputValue]);

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
