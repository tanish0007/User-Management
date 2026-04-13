interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  startEntry: number;
  endEntry: number;
  isFiltered: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function Pagination({
  currentPage, totalPages, totalEntries,
  startEntry, endEntry, isFiltered,
  onPrev, onNext,
}: PaginationProps) {
  if (totalEntries === 0) return null;
  return (
    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/20">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          {startEntry}–{endEntry}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          {totalEntries}
        </span>{" "}
        {totalEntries === 1 ? "entry" : "entries"}
        {isFiltered && (
          <span className="ml-1 text-gray-400 dark:text-gray-500">(filtered)</span>
        )}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}