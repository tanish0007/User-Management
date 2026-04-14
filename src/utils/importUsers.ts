
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { User } from "@/types/user";

export type ImportFormat = "csv" | "excel";

interface ImportResult {
  imported: number;
  skipped: number;
  merged: User[];
}

/**
 * Validates that a row has the required User fields with correct types.
 */
function isValidUser(row: unknown): row is { username: string; email: string; age: string | number } {
  if (typeof row !== "object" || row === null) return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.username === "string" && r.username.trim() !== "" &&
    typeof r.email === "string" && r.email.trim() !== "" &&
    (typeof r.age === "number" || (typeof r.age === "string" && !isNaN(Number(r.age))))
  );
}


function mergeUsers(existingUsers: User[], incoming: User[]): ImportResult {
  const merged = [...existingUsers];
  
  const seenUsernames = new Set(existingUsers.map((u) => u.username.toLowerCase()));
  const seenEmails = new Set(existingUsers.map((u) => u.email.toLowerCase()));

  let imported = 0;
  let skipped = 0;

  for (const u of incoming) {
    const uname = u.username.trim().toLowerCase();
    const email = u.email.trim().toLowerCase();

    if (seenUsernames.has(uname) || seenEmails.has(email)) {
      skipped++;
      continue;
    }

    seenUsernames.add(uname);
    seenEmails.add(email);
    merged.push({ username: u.username.trim(), email: u.email.trim(), age: Number(u.age) });
    imported++;
  }

  return { imported, skipped, merged };
}


export function importFromCSV(file: File, existingUsers: User[]): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true, // first row is header
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(), // normalise header casing
      complete: (results) => {
        const valid: User[] = [];
        for (const row of results.data) {
          // Re-map lowercased headers back to our type
          const normalised = {
            username: String(row["username"] ?? "").trim(),
            email: String(row["email"] ?? "").trim(),
            age: row["age"],
          };
          if (isValidUser(normalised)) {
            valid.push({ username: normalised.username, email: normalised.email, age: Number(normalised.age) });
          }
        }
        resolve(mergeUsers(existingUsers, valid));
      },
      error: (err) => reject(err),
    });
  });
}

/**
 * Parses an Excel (.xlsx / .xls) file and returns the merge result.
 * Expects headers: username, email, age (case-insensitive).
 */
export function importFromExcel(file: File, existingUsers: User[]): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]]; // first sheet
        // sheet_to_json gives us an array of objects keyed by header row
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

        const valid: User[] = [];
        for (const row of rows) {
          // Normalise header keys to lowercase for flexible matching
          const normalised: Record<string, unknown> = {};
          for (const key of Object.keys(row)) {
            normalised[key.trim().toLowerCase()] = row[key];
          }
          const candidate = {
            username: String(normalised["username"] ?? "").trim(),
            email: String(normalised["email"] ?? "").trim(),
            age: normalised["age"],
          };
          if (isValidUser(candidate)) {
            valid.push({ username: candidate.username, email: candidate.email, age: Number(candidate.age) });
          }
        }
        resolve(mergeUsers(existingUsers, valid));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}