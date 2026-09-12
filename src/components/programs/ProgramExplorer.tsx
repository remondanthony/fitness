"use client";

import { SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { programFilterGroups, type Program } from "@/data/programs";
import { emptySelection, matchesFilters, toggleFilter } from "@/lib/filters";

/** Client-side filtering for the programs library. */
export function ProgramExplorer({ programs }: { programs: Program[] }) {
  const [selection, setSelection] = useState(() => emptySelection(programFilterGroups));

  const results = useMemo(
    () => programs.filter((program) => matchesFilters(program, selection)),
    [programs, selection],
  );

  const clear = () => setSelection(emptySelection(programFilterGroups));

  return (
    <div className="flex flex-col gap-10">
      <FilterBar
        groups={programFilterGroups}
        selection={selection}
        onToggle={(groupId, value) =>
          setSelection((current) => toggleFilter(current, groupId, value))
        }
        onClear={clear}
      />

      <div className="flex items-baseline justify-between gap-4">
        <p className="text-fog text-xs font-semibold tracking-[0.2em] uppercase">
          Showing {results.length} of {programs.length} programs
        </p>
      </div>

      {results.length > 0 ? (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((program) => (
            <li key={program.slug} className="animate-rise">
              <ProgramCard program={program} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No Programs Match Your Filters"
          description="Try relaxing a filter or two to see more programs."
          action={
            <Button variant="secondary" onClick={clear}>
              Clear all filters
            </Button>
          }
        />
      )}
    </div>
  );
}
