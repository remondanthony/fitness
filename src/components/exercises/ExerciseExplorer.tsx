"use client";

import { SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { SearchInput } from "@/components/ui/SearchInput";
import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import { exerciseFilterGroups, type Exercise } from "@/data/exercises";
import { emptySelection, matchesFilters, matchesQuery, toggleFilter } from "@/lib/filters";

/** Client-side search + filtering for the exercise library. */
export function ExerciseExplorer({ exercises }: { exercises: Exercise[] }) {
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState(() => emptySelection(exerciseFilterGroups));

  const results = useMemo(
    () =>
      exercises.filter(
        (exercise) =>
          matchesFilters(exercise, selection) &&
          matchesQuery(query, [
            exercise.name,
            exercise.primaryMuscle,
            exercise.equipmentLabel,
            ...exercise.musclesWorked.primary,
            ...exercise.musclesWorked.secondary,
          ]),
      ),
    [exercises, selection, query],
  );

  const clear = () => {
    setSelection(emptySelection(exerciseFilterGroups));
    setQuery("");
  };

  return (
    <div className="flex flex-col gap-10">
      <FilterBar
        groups={exerciseFilterGroups}
        selection={selection}
        onToggle={(groupId, value) =>
          setSelection((current) => toggleFilter(current, groupId, value))
        }
        onClear={clear}
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Search exercises"
          placeholder="Search exercises..."
        />
      </FilterBar>

      <p className="text-fog text-xs font-semibold tracking-[0.2em] uppercase">
        Showing {results.length} of {exercises.length} exercises
      </p>

      {results.length > 0 ? (
        <ul key={results.length} className="animate-fade-in grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((exercise, index) => (
            <li key={exercise.slug} className="animate-rise">
              <ExerciseCard exercise={exercise} index={index} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No Exercises Found"
          description="Try changing your filters or search term."
          action={
            <Button variant="secondary" onClick={clear}>
              Reset search and filters
            </Button>
          }
        />
      )}
    </div>
  );
}
