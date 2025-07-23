"use client";

export type SortOption = 'stars' | 'forks' | 'none';

interface SortControlsProps {
  sortBy: SortOption;
  onSortChange: (newSort: SortOption) => void;
}

export default function SortControls({ sortBy, onSortChange }: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 font-medium">Sort by:</span>
      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        <button
          onClick={() => onSortChange('none')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            sortBy === 'none'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Default
        </button>
        <button
          onClick={() => onSortChange('stars')}
          className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
            sortBy === 'stars'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          ⭐ Stars
        </button>
        <button
          onClick={() => onSortChange('forks')}
          className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
            sortBy === 'forks'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          🍴 Forks
        </button>
      </div>
    </div>
  );
} 