import _ from "lodash";

export type Selection = {
  year?: string;
  place?: string;
  state?: string;
  q?: string;
  p?: number;
  tags?: string[];
  weapon?: string;
  age?: string;
};

const paginate = (array: any[], pageSize: number, pageNumber: number) => {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
};

const isNumber = (n: any): boolean => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const constructUrl = (params: Partial<Selection>) => {
  const paramsString = Object.entries(params)
    .filter((x) => !!x[1] && (!Array.isArray(x[1]) || x[1].length))
    .map((x) => `${x[0]}=${x[1]}`);

  if (paramsString.length === 0) return "/#chronik";

  return `/?${paramsString.join("&")}#chronik`;
};

interface ConstructUrlWithQParams {
  [key: string]: any;
}

const constructUrlWithQ = (
  q: string | null,
  params: ConstructUrlWithQParams
): string => {
  if (q !== null) params["q"] = q;
  return constructUrl(params);
};

interface DataItem {
  year: number;
}

interface ArrItem {
  value: string;
  count: number;
}

const addMissingYears = (
  data: DataItem[],
  arr: ArrItem[],
  minYear: number | null = null,
  maxYear: number | null = null
): ArrItem[] => {
  const years = arr.map(({ value }) => parseInt(value));
  for (const i of _.range(
    maxYear || data[data.length - 1].year,
    minYear || data[0].year
  )) {
    if (!years.includes(i)) arr.push({ value: `${i}`, count: 0 });
  }
  return arr;
};

interface ArrayItem {
  value: string;
  count: number;
  count2?: number;
  count3?: number;
  tooltipLabel?: {
    count: string;
    count2: string;
    count3?: string;
  };
}

const combineArray = (
  arr1: ArrayItem[],
  arr2: ArrayItem[],
  count1Label: string,
  count2Label: string
): ArrayItem[] => {
  for (const x of arr1) {
    const sameValue = arr2.filter(({ value }) => value === x.value);
    if (sameValue.length) x.count2 = sameValue[0].count;
    x.tooltipLabel = {
      count: count1Label,
      count2: count2Label,
    };
  }
  return arr1;
};

const combineThree = (
  arr1: ArrayItem[],
  arr2: ArrayItem[],
  arr3: ArrayItem[],
  count1Label: string,
  count2Label: string,
  count3Label: string
): ArrayItem[] => {
  for (const x of arr1) {
    const sameValue = arr2.filter(({ value }) => value === x.value);
    if (sameValue.length) x.count2 = sameValue[0].count;
    x.tooltipLabel = {
      count: count1Label,
      count2: count2Label,
    };
  }
  for (const x of arr1) {
    const sameValue = arr3.filter(({ value }) => value === x.value);
    if (sameValue.length) x.count3 = sameValue[0].count;

    if (!x.tooltipLabel) {
      x.tooltipLabel = {
        count: count1Label,
        count2: count2Label,
        count3: count3Label,
      };
    } else {
      x.tooltipLabel.count3 = count3Label;
    }
  }
  return arr1;
};

export {
  addMissingYears,
  combineArray,
  combineThree,
  constructUrl,
  constructUrlWithQ,
  isNumber,
  paginate,
};
