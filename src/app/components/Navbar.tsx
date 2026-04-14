"use client";
import { RefObject } from "react";
import ThemeToggle from "./ThemeToggle";
import { ImportFormat } from "@/utils/importUsers";
import { ExportFormat } from "@/utils/exportUsers";
import Link from "next/link";
import { User } from "lucide-react";

interface NavbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  onAddUser: () => void;
  importDropdownOpen: boolean;
  exportDropdownOpen: boolean;
  onToggleImportDropdown: () => void;
  onToggleExportDropdown: () => void;
  onImport: (format: ImportFormat) => void;
  onExport: (format: ExportFormat) => void;
  importRef: RefObject<HTMLDivElement | null>;
  exportRef: RefObject<HTMLDivElement | null>;
}

export default function Navbar({
  search,
  onSearchChange,
  onAddUser,
  importDropdownOpen,
  exportDropdownOpen,
  onToggleImportDropdown,
  onToggleExportDropdown,
  onImport,
  onExport,
  importRef,
  exportRef,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center gap-3">

        <Link href="/profile"><User className="w-10 h-10 p-2 bg-blue-50 rounded-full text-blue-500 hover:border-2" /></Link>

        {/* Brand */}
        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mr-auto">
          User Management
        </span>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search users…"
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm
                     bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48"
        />

        <div className="relative" ref={importRef}>
          <button
            onClick={onToggleImportDropdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                       bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300
                       border border-emerald-300 dark:border-emerald-700
                       hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
            </svg>
            Import
            <svg className={`w-3 h-3 transition-transform ${importDropdownOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {importDropdownOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-lg shadow-lg
                            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                            overflow-hidden z-50">
              <button
                onClick={() => onImport("csv")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left
                           text-gray-700 dark:text-gray-200
                           hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
              >
                Import CSV
              </button>
              <button
                onClick={() => onImport("excel")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left
                           text-gray-700 dark:text-gray-200
                           hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors
                           border-t border-gray-100 dark:border-gray-700"
              >
                Import Excel
              </button>
              <p className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 border-t
                            border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                Columns: username, email, age
              </p>
            </div>
          )}
        </div>

        {/* ── EXPORT DROPDOWN ──────────────────────────────────────────── */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={onToggleExportDropdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                       bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300
                       border border-indigo-300 dark:border-indigo-700
                       hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            Export
            <svg className={`w-3 h-3 transition-transform ${exportDropdownOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {exportDropdownOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-lg shadow-lg
                            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                            overflow-hidden z-50">
              <button
                onClick={() => onExport("csv")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left
                           text-gray-700 dark:text-gray-200
                           hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              >
                Export as CSV
              </button>
              <button
                onClick={() => onExport("excel")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left
                           text-gray-700 dark:text-gray-200
                           hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors
                           border-t border-gray-100 dark:border-gray-700"
              >
                Export as Excel
              </button>
              <button
                onClick={() => onExport("pdf")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left
                           text-gray-700 dark:text-gray-200
                           hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors
                           border-t border-gray-100 dark:border-gray-700"
              >
                Export as PDF
              </button>
            </div>
          )}
        </div>

        {/* Add User */}
        <button
          onClick={onAddUser}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                     bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>

        <ThemeToggle />
      </div>
    </nav>
  );
}