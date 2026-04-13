import { useReducer, useEffect, useMemo } from "react";
import { User, UsersState, UsersAction, SortField, SortOrder } from "@/types/user";

const ITEMS_PER_PAGE = 4;

const initialState: UsersState = {
  users: [],
  search: "",
  sortField: "username",
  sortOrder: "asc",
  currentPage: 1,
};

function reducer(state: UsersState, action: UsersAction): UsersState {
  switch (action.type) {
    case "SET_USERS":
      return { ...state, users: action.payload };
    case "ADD_USER": {
      const updated = [...state.users, action.payload];
      localStorage.setItem("users", JSON.stringify(updated));
      return { ...state, users: updated };
    }
    case "DELETE_USER": {
      const updated = state.users.filter((u) => u.username !== action.payload);
      localStorage.setItem("users", JSON.stringify(updated));
      return { ...state, users: updated };
    }
    case "UPDATE_USER": {
      const updated = state.users.map((u) =>
        u.username === action.payload.oldUsername ? action.payload.updated : u
      );
      localStorage.setItem("users", JSON.stringify(updated));
      return { ...state, users: updated };
    }
    case "SET_SEARCH":
      return { ...state, search: action.payload, currentPage: 1 };
    case "SET_SORT_FIELD":
      return { ...state, sortField: action.payload, currentPage: 1 };
    case "SET_SORT_ORDER":
      return { ...state, sortOrder: action.payload, currentPage: 1 };
    case "SET_PAGE":
      return { ...state, currentPage: action.payload };
    default:
      return state;
  }
}

export function useUsers() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("users") || "[]");
      dispatch({ type: "SET_USERS", payload: stored });
    } catch {
      dispatch({ type: "SET_USERS", payload: [] });
    }
  }, []);

  const filteredSorted = useMemo(() => {
    let result = [...state.users];
    const q = state.search.trim().toLowerCase();
    if (q) {
      if (/^\d/.test(q)) {
        result = result.filter((u) => u.age.toString().includes(q));
      } else {
        result = result.filter(
          (u) =>
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
      }
    }
    result.sort((a, b) => {
      const aVal = state.sortField === "age" ? a.age : a[state.sortField].toLowerCase();
      const bVal = state.sortField === "age" ? b.age : b[state.sortField].toLowerCase();
      if (aVal < bVal) return state.sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return state.sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [state.users, state.search, state.sortField, state.sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / ITEMS_PER_PAGE));
  const safePage = Math.min(state.currentPage, totalPages);
  const paginated = filteredSorted.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  return {
    state: { ...state, currentPage: safePage },
    dispatch,
    filteredSorted,
    paginated,
    totalPages,
    ITEMS_PER_PAGE,
  };
}