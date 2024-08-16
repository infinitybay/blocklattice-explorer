import type { SORT_BY } from "pages/LargeTransactions";

export type PageParams = {
  account?: string;
  block?: string;
  feed?: string;
  sortBy?: SORT_BY;
  section?: string;
}
