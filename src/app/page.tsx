"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import Navbar from "./components/Navbar";
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { useUsers } from "@/hooks/useUsers";
import { User, SortField, SortOrder } from "@/types/user";

export default function Home() {
  const { state, dispatch, filteredSorted, paginated, totalPages, ITEMS_PER_PAGE } = useUsers();
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAddUser = () => {
    setEditUser(null);
    setFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setFormOpen(true);
  };

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

  const handleDeleteRequest = (username: string) => {
    setDeleteTarget(username);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch({ type: "DELETE_USER", payload: deleteTarget });
      toast.success("User deleted successfully");
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state.users, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported successfully");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported: User[] = JSON.parse(ev.target?.result as string);
          const merged = [...state.users];
          let added = 0;
          for (const u of imported) {
            if (!merged.find((x) => x.username === u.username || x.email === u.email)) {
              merged.push(u);
              added++;
            }
          }
          dispatch({ type: "SET_USERS", payload: merged });
          localStorage.setItem("users", JSON.stringify(merged));
          toast.success(`Imported ${added} new user(s)`);
        } catch {
          toast.error("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar
        search={state.search}
        sortField={state.sortField}
        sortOrder={state.sortOrder}
        onSearchChange={(v) => dispatch({ type: "SET_SEARCH", payload: v })}
        onSortFieldChange={(v: SortField) => dispatch({ type: "SET_SORT_FIELD", payload: v })}
        onSortOrderChange={(v: SortOrder) => dispatch({ type: "SET_SORT_ORDER", payload: v })}
        onAddUser={handleAddUser}
        onImport={handleImport}
        onExport={handleExport}
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