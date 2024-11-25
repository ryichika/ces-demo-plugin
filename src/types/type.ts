
export type TaxonomyData = {
  category: string;
  taxonomy: string;
  tagName: string;
  tagValue: string;
  count: number;
};

export type TaxonomyItem = {
  id: number;
  label: string;
  count: number;
  sourceData?: TaxonomyData;
  children?: TaxonomyItem[];
};

export type AggregatedResult = {
  totalCount: number;
  result: any;
};

