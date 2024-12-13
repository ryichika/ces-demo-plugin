import { atom } from 'jotai';
import { TaxonomyData, TaxonomyItem, AggregatedResult } from "@/types/type";

export const itemsState = atom<TaxonomyItem[]>([]);

export const selectedTaxonomiesState = atom<string[]>([]);

export const itemIdState = atom<number>(1);