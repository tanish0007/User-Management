// src/app/components/UserTable.tsx
"use client";
import { Pencil, Trash2, Users, Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import AgeBadge from "./AgeBadge";
import Pagination from "./Pagination";
import { User, SortField, SortOrder } from "@/types/user";

const avatarColors = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
];

interface UserTableProps {
  allUsers: User[];
  paginated: User[];
  search: string;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  filteredCount: number;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onEdit: (user: User) => void;
  onDelete: (username: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

// Renders the correct sort arrow for a column header
function SortIcon({ field, sortField, sortOrder }: {
  field: SortField;
  sortField: SortField;
  sortOrder: SortOrder;
}) {
  if (field !== sortField) {
    // Column is not active — show neutral double chevron
    return <ChevronsUpDown className="w-3.5 h-3.5 opacity-30" />;
  }
  // Active column — show direction arrow
  return sortOrder === "asc"
    ? <ChevronUp className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
    : <ChevronDown className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />;
}

export default function UserTable({
  allUsers, paginated, search,
  currentPage, totalPages, itemsPerPage, filteredCount,
  sortField, sortOrder, onSort,
  onEdit, onDelete, onPrev, onNext,
}: UserTableProps) {
  const startEntry = filteredCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, filteredCount);

  // Columns that are sortable — maps label → SortField key
  const sortableColumns: { label: string; field: SortField }[] = [
    { label: "User",  field: "username" },
    { label: "Email", field: "email" },
    { label: "Age",   field: "age" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-700/50">
              {sortableColumns.map(({ label, field }) => (
                <th
                  key={field}
                  className="px-6 py-3.5 text-left"
                >
                  {/* Clickable header button */}
                  <button
                    onClick={() => onSort(field)}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider
                               text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400
                               transition-colors group"
                  >
                    {label}
                    <SortIcon field={field} sortField={sortField} sortOrder={sortOrder} />
                  </button>
                </th>
              ))}

              {/* Actions column — not sortable */}
              <th className="px-6 py-3.5 text-right pr-7 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
            {allUsers.length === 0 ? (
              <EmptyRow icon="users" message="No users yet" sub='Click "+ Add User" to get started' />
            ) : filteredCount === 0 ? (
              <EmptyRow icon="search" message={`No results for "${search}"`} sub="Try a different name, email, or age" />
            ) : (
              paginated.map((user) => {
                const color = avatarColors[user.username.charCodeAt(0) % avatarColors.length];
                const initials = user.username.slice(0, 2).toUpperCase();
                return (
                  <tr
                    key={user.email}
                    className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${color}`}>
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="px-6 py-4"><AgeBadge age={user.age} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1 opacity-100 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(user)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all"
                          title="Edit user"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(user.username)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalEntries={filteredCount}
        startEntry={startEntry}
        endEntry={endEntry}
        isFiltered={!!search.trim()}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  );
}

function EmptyRow({ icon, message, sub }: { icon: "users" | "search"; message: string; sub: string }) {
  return (
    <tr>
      <td colSpan={4} className="px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
            {icon === "users" ? (
              <Users className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            ) : (
              <Search className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{message}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
        </div>
      </td>
    </tr>
  );
}