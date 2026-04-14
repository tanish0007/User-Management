"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { LoaderIcon, X } from "lucide-react";
import { User } from "@/types/user";

const userSchema = z.object({
  username: z
    .string()
    .min(3, "Must be at least 3 characters")
    .regex(/^[a-zA-Z]{3}/, "First 3 characters must be letters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscore allowed"),
  email: z.email("Invalid email format"),
  age: z.coerce
    .number("Age must be a number")
    .int("Age must be a whole number")
    .min(18, "Age must be at least 18")
    .max(100, "Age must be at most 100"),
});

interface UserFormModalProps {
  isOpen: boolean;
  editUser?: User | null;
  existingUsers: User[];
  onClose: () => void;
  onSave: (user: User) => void;
}

export default function UserFormModal({
  isOpen, editUser, existingUsers, onClose, onSave,
}: UserFormModalProps) {
  const [formData, setFormData] = useState({ username: "", email: "", age: "" });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!editUser;

  useEffect(() => {
    if (isOpen) {
      setFormData(
        editUser
          ? { username: editUser.username, email: editUser.email, age: String(editUser.age) }
          : { username: "", email: "", age: "" }
      );
      setErrors({});
    }
  }, [isOpen, editUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "username" && value && !/^[a-zA-Z0-9_]*$/.test(value)) return;
    if (name === "age" && value && !/^\d*$/.test(value)) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    setErrors((prev) => ({ ...prev, [name]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 300));

    const allErrors: Record<string, string[]> = {
      username: [],
      email: [],
      age: [],
    };

    // Priority 1 — Required checks
    const emptyUsername = !formData.username.trim();
    const emptyEmail    = !formData.email.trim();
    const emptyAge      = !formData.age.trim();
    if (emptyUsername) allErrors.username = ["Username is required"];
    if (emptyEmail)    allErrors.email    = ["Email is required"];
    if (emptyAge)      allErrors.age      = ["Age is required"];

    // Priority 2 — Zod (only for fields that passed the required check)
    const result = userSchema.safeParse(formData);
    console.log(result);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        // Only set if we haven't already assigned a required error for this field
        if (field in allErrors && allErrors[field].length === 0) {
          allErrors[field] = [issue.message];
        }
      });
    }

    // Priority 3 — Duplicate checks (only for fields that passed both above)
    const others = isEditing
      ? existingUsers.filter((u) => u.username !== editUser!.username)
      : existingUsers;

    if (allErrors.username.length === 0 && others.some((u) => u.username === formData.username))
      allErrors.username = ["Username already exists"];
    if (allErrors.email.length === 0 && others.some((u) => u.email === formData.email))
      allErrors.email = ["Email already exists"];

    // ── If any field has an error — show all at once and stop 
    const hasErrors = Object.values(allErrors).some((errs) => errs.length > 0);
    if (hasErrors) {
      setErrors(allErrors);
      setIsLoading(false);
      return;
    }

    // ── All clean — save
    onSave((result as { success: true; data: User }).data);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 relative">
        
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
          {isEditing ? "Edit User" : "Enter your details"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex gap-4">
            <Field label="Username" errors={errors.username}>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="john_doe"
                disabled={isLoading}
                className={inputCls(!!(errors.username?.length))}
              />
            </Field>
            <Field label="Age" errors={errors.age}>
              <input
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
                disabled={isLoading}
                className={inputCls(!!(errors.age?.length))}
              />
            </Field>
          </div>

          <Field label="Email" errors={errors.email}>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              disabled={isLoading}
              className={inputCls(!!(errors.email?.length))}
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setFormData({ username: "", email: "", age: "" });
                setErrors({});
              }}
              className="flex-1 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 text-sm font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                "Update"
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  errors,
  children,
}: {
  label: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      {children}
      {errors && errors.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {errors.map((msg, i) => (
            <li key={i} className="text-xs text-red-500 flex items-start gap-1">
              <span className="mt-px">•</span>
              <span>{msg}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full px-3 py-2 text-sm rounded-xl border ${
    hasError
      ? "border-red-400 dark:border-red-500 focus:ring-red-400/40"
      : "border-gray-200 dark:border-gray-600 focus:ring-blue-500/40"
  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all`;
}