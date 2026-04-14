// src/app/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Navbar from "./components/Navbar";
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { useUsers } from "@/hooks/useUsers";
import { User, SortField, SortOrder } from "@/types/user";
import { importFromCSV, importFromExcel, ImportFormat } from "@/utils/importUsers";
import { exportToCSV, exportToExcel, exportToPDF, ExportFormat } from "@/utils/exportUsers";

export default function Home() {
  const { state, dispatch, filteredSorted, paginated, totalPages, ITEMS_PER_PAGE } = useUsers();
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [importDropdownOpen, setImportDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const importRef = useRef<HTMLDivElement | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (importRef.current && !importRef.current.contains(e.target as Node))
        setImportDropdownOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target as Node))
        setExportDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  const handleSort = (field: SortField) => {
    if (field === state.sortField) {
      // Toggle direction on the same column
      dispatch({
        type: "SET_SORT_ORDER",
        payload: state.sortOrder === "asc" ? "desc" : "asc",
      });
    } else {
      // Switch to new column, always start ascending
      dispatch({ type: "SET_SORT_FIELD", payload: field });
      dispatch({ type: "SET_SORT_ORDER", payload: "asc" });
    }
  };

  const handleAddUser = () => { setEditUser(null); setFormOpen(true); };
  const handleEditUser = (user: User) => { setEditUser(user); setFormOpen(true); };

  const handleSave = (user: User) => {
    if (editUser) {
      dispatch({ type: "UPDATE_USER", payload: { oldUsername: editUser.username, updated: user } });
      toast.success("User updated successfully");
    } else {
      dispatch({ type: "ADD_USER", payload: user });
      toast.success("User added successfully");
    }
    setFormOpen(false);
    setEditUser(null);
  };

  const handleDeleteRequest = (username: string) => setDeleteTarget(username);
  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch({ type: "DELETE_USER", payload: deleteTarget });
      toast.success("User deleted successfully");
      setDeleteTarget(null);
    }
  };

  // ── Import ───────────────────────────────────────────────────────────────────
  const handleImport = (format: ImportFormat) => {
    setImportDropdownOpen(false);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = format === "csv" ? ".csv" : ".xlsx,.xls";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const result =
          format === "csv"
            ? await importFromCSV(file, state.users)
            : await importFromExcel(file, state.users);
        dispatch({ type: "SET_USERS", payload: result.merged });
        localStorage.setItem("users", JSON.stringify(result.merged));
        toast.success(`${result.imported} imported, ${result.skipped} duplicates skipped`);
      } catch {
        toast.error(`Failed to parse ${format.toUpperCase()} file. Check format.`);
      }
    };
    input.click();
  };

  // ── Export ───────────────────────────────────────────────────────────────────
  const handleExport = (format: ExportFormat) => {
    setExportDropdownOpen(false);
    if (state.users.length === 0) { toast.error("No users to export"); return; }
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `users_${timestamp}`;
    switch (format) {
      case "csv":
        exportToCSV(state.users, `${filename}.csv`);
        toast.success(`Successfully exported to ${filename}.csv`);
        break;
      case "excel":
        exportToExcel(state.users, `${filename}.xlsx`);
        toast.success(`Successfully exported to ${filename}.xlsx`);
        break;
      case "pdf":
        exportToPDF(state.users, `${filename}.pdf`);
        toast.success(`Successfully exported to ${filename}.pdf`);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar
        search={state.search}
        onSearchChange={(v) => dispatch({ type: "SET_SEARCH", payload: v })}
        onAddUser={handleAddUser}
        importDropdownOpen={importDropdownOpen}
        exportDropdownOpen={exportDropdownOpen}
        onToggleImportDropdown={() => {
          setImportDropdownOpen((p) => !p);
          setExportDropdownOpen(false);
        }}
        onToggleExportDropdown={() => {
          setExportDropdownOpen((p) => !p);
          setImportDropdownOpen(false);
        }}
        onImport={handleImport}
        onExport={handleExport}
        importRef={importRef}
        exportRef={exportRef}
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-200">{state.users.length}</span>{" "}
            total {state.users.length === 1 ? "user" : "users"} registered
          </p>
        </div>

        <UserTable
          allUsers={state.users}
          paginated={paginated}
          search={state.search}
          currentPage={state.currentPage}
          totalPages={totalPages}
          itemsPerPage={ITEMS_PER_PAGE}
          filteredCount={filteredSorted.length}
          sortField={state.sortField}
          sortOrder={state.sortOrder}
          onSort={handleSort}
          onEdit={handleEditUser}
          onDelete={handleDeleteRequest}
          onPrev={() => dispatch({ type: "SET_PAGE", payload: state.currentPage - 1 })}
          onNext={() => dispatch({ type: "SET_PAGE", payload: state.currentPage + 1 })}
        />
      </main>

      <UserFormModal
        isOpen={formOpen}
        editUser={editUser}
        existingUsers={state.users}
        onClose={() => { setFormOpen(false); setEditUser(null); }}
        onSave={handleSave}
      />

      {deleteTarget && (
        <DeleteConfirmModal
          username={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}