import { TextInput } from "@mantine/core";
import _ from "lodash";
import router from "next/router";
import { useCallback, useMemo } from "react";
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

  return (
    <TextInput
      value={q}
      label="Suche"
      placeholder="z. B. Wohnung, Flucht, Rücken, Kopf"
      onChange={searchFunc}
    />
  );
};

export default SearchInput;
