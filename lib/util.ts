export type Selection = {
  year?: string;
  place?: string;
  state?: string;
  q?: string;
  p?: number;
  tags?: string[];
  weapon?: string;
  age?: string;
  sort?: "relevance" | "date";
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
    .map((x) => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`);

  if (paramsString.length === 0) return "/";

  return `/?${paramsString.join("&")}`;
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
  const start = maxYear || data[data.length - 1].year;
  const end = minYear || data[0].year;
  for (let i = start; i > end; i--) {
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

function orderBy<T>(
  arr: T[],
  iteratees: string | ((item: T) => any) | (string | ((item: T) => any))[],
  orders?: string | string[]
): T[] {
  const keys = Array.isArray(iteratees) ? iteratees : [iteratees];
  const dirs = Array.isArray(orders) ? orders : orders ? [orders] : [];
  return [...arr].sort((a, b) => {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const dir = (dirs[i] || "asc") === "desc" ? -1 : 1;
      const va = typeof key === "function" ? key(a) : (a as any)[key];
      const vb = typeof key === "function" ? key(b) : (b as any)[key];
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
    }
    return 0;
  });
}

function round(num: number, precision: number = 0): number {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}

function countBy<T>(arr: T[], fn: ((item: T) => string | number) | string): Record<string, number> {
  const getter = typeof fn === "string" ? (item: T) => (item as any)[fn] : fn;
  const result: Record<string, number> = {};
  for (const item of arr) {
    const key = String(getter(item));
    result[key] = (result[key] || 0) + 1;
  }
  return result;
}

function groupBy<T>(arr: T[], fn: ((item: T) => string) | string): Record<string, T[]> {
  const getter = typeof fn === "string" ? (item: T) => String((item as any)[fn]) : fn;
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = getter(item);
    (result[key] = result[key] || []).push(item);
  }
  return result;
}

function uniqBy<T>(arr: T[], fn: ((item: T) => any) | string): T[] {
  const getter = typeof fn === "string" ? (item: T) => (item as any)[fn] : fn;
  const seen = new Set();
  return arr.filter((item) => {
    const key = getter(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export {
  addMissingYears,
  combineArray,
  combineThree,
  constructUrl,
  constructUrlWithQ,
  countBy,
  groupBy,
  isNumber,
  orderBy,
  paginate,
  round,
  uniqBy,
};
