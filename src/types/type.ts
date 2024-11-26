export type TaxonomyItem = {
  id: string;
  label: string;
  count: number;
  sourceData?: TaxonomyData;
  children?: TaxonomyItem[];
};

export type TaxonomyData = {
  category: string;
  taxonomy: string;
  tagName: string;
  tagValue: string;
  count: number;
};

export type AggregatedResult = {
  totalCount: number;
  result: any;
};

