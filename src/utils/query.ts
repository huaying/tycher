export const extractSingleQuery = (query: string | string[] | undefined) =>
  Array.isArray(query) ? query[0] : query;
