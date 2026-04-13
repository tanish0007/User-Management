"use client";
import { Search, Users } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { SortField, SortOrder } from "@/types/user";

interface NavbarProps {
  search: string;
  sortField: SortField;
  sortOrder: SortOrder;
  onSearchChange: (v: string) => void;
  onSortFieldChange: (v: SortField) => void;
  onSortOrderChange: (v: SortOrder) => void;
  onAddUser: () => void;
  onImport: () => void;
  onExport: () => void;
}

export default function Navbar({
  search, sortField, sortOrder,
  onSearchChange, onSortFieldChange, onSortOrderChange,
  onAddUser, onImport, onExport,
}: NavbarProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight whitespace-nowrap">
            User Management
          </span>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, or age…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
          />
        </div>

        {/* Sort field */}
        <select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value as SortField)}
          className="py-2 px-3 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer"
        >
          <option value="username">Username</option>
          <option value="email">Email</option>
          <option value="age">Age</option>
        </select>

        {/* Sort order */}
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
          className="py-2 px-3 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAddUser}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            + Add User
          </button>
          <button
            onClick={onImport}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl transition-colors"
          >
            Import
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl transition-colors"
          >
            Export
          </button>
        </div>

        {/* Theme toggle */}
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}