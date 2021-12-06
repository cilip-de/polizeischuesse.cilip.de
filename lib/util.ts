import _ from "lodash";

const paginate = (array: [], pageSize: number, pageNumber: number) => {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
};

const isNumber = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const constructUrl = (params: Partial<Selection>) => {
  const paramsString = Object.entries(params)
    .filter((x) => !!x[1] && (!Array.isArray(x[1]) || x[1].length))
    .map((x) => `${x[0]}=${x[1]}`);

  if (paramsString.length === 0) return "/#chronik";

  return `/?${paramsString.join("&")}#chronik`;
};

const constructUrlWithQ = (q, params) => {
  if (q !== null) params["q"] = q;
  return constructUrl(params);
};

const addMissingYears = (data, arr, minYear = null, maxYear = null) => {
  const years = arr.map(({ value }) => parseInt(value));
  for (const i of _.range(
    maxYear || data[data.length - 1].year,
    minYear || data[0].year
  )) {
    if (!years.includes(i)) arr.push({ value: `${i}`, count: 0 });
  }
  return arr;
};

const combineArray = (arr1, arr2, count1Label, count2Label) => {
  for (const x of arr1) {
    const bla = arr2.filter(({ value }) => value === x.value);
    if (bla.length) x.count2 = bla[0].count;
    x.tooltipLabel = {
      count: count1Label,
      count2: count2Label,
    };
  }
  return arr1;
};

export {
  paginate,
  isNumber,
  constructUrl,
  constructUrlWithQ,
  addMissingYears,
  combineArray,
};
