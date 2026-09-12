/** Primitives shared by the program and exercise catalogues. */

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterGroupDef = {
  /** Key used in the facet map and in the selection state. */
  id: string;
  label: string;
  options: FilterOption[];
};

/** Selected filter values, keyed by filter group id. */
export type FilterSelection = Record<string, string[]>;

/**
 * Anything filterable declares which facet values it matches. Keeping this on
 * the record itself means the filter engine never needs to know the shape of
 * the item it is filtering.
 */
export type Faceted = {
  facets: Record<string, string[]>;
};
