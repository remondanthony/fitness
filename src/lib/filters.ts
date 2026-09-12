import type { Faceted, FilterGroupDef, FilterSelection } from "@/data/types";

/** An empty selection for a set of filter groups. */
export function emptySelection(groups: FilterGroupDef[]): FilterSelection {
  return Object.fromEntries(groups.map((group) => [group.id, []]));
}

/** Toggle one value inside one filter group, returning a new selection. */
export function toggleFilter(
  selection: FilterSelection,
  groupId: string,
  value: string,
): FilterSelection {
  const current = selection[groupId] ?? [];
  return {
    ...selection,
    [groupId]: current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value],
  };
}

/** Total number of active filter values across every group. */
export function countActive(selection: FilterSelection): number {
  return Object.values(selection).reduce((total, values) => total + values.length, 0);
}

/**
 * An item matches when, for every group that has a selection, it carries at
 * least one of the selected values — OR within a group, AND across groups.
 */
export function matchesFilters(item: Faceted, selection: FilterSelection): boolean {
  return Object.entries(selection).every(([groupId, values]) => {
    if (values.length === 0) return true;
    const facet = item.facets[groupId] ?? [];
    return values.some((value) => facet.includes(value));
  });
}

/** Case-insensitive match of a query against a set of searchable strings. */
export function matchesQuery(query: string, haystack: string[]): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  return haystack.some((entry) => entry.toLowerCase().includes(term));
}
