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

export { paginate, isNumber, constructUrl, constructUrlWithQ };
