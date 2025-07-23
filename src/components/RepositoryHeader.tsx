"use client";

import SortControls, { SortOption } from './SortControls';

interface RepositoryHeaderProps {
  repositoryCount: number;
  hasMoreRepositories: boolean;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  sortedRepositoriesLength: number;
  sortBy: SortOption;
  onSortChange: (newSort: SortOption) => void;
}

export default function RepositoryHeader({
  repositoryCount,
  hasMoreRepositories,
  totalPages,
  startIndex,
  endIndex,
  sortedRepositoriesLength,
  sortBy,
  onSortChange,
}: RepositoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Repositories ({repositoryCount})
          {hasMoreRepositories && (
            <span className="text-sm text-gray-500 font-normal ml-2">
              (More available)
            </span>
          )}
        </h2>
        {totalPages > 1 && (
          <div className="text-sm text-gray-600 mt-1">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedRepositoriesLength)} of {sortedRepositoriesLength}
          </div>
        )}
      </div>
      
      <SortControls sortBy={sortBy} onSortChange={onSortChange} />
    </div>
  );
} 