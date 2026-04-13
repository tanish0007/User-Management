export interface User {
  username: string;
  email: string;
  age: number;
}

export type SortField = "username" | "email" | "age";
export type SortOrder = "asc" | "desc";

export interface UsersState {
  users: User[];
  search: string;
  sortField: SortField;
  sortOrder: SortOrder;
  currentPage: number;
}

export type UsersAction =
  | { type: "SET_USERS"; payload: User[] }
  | { type: "ADD_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "UPDATE_USER"; payload: { oldUsername: string; updated: User } }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_SORT_FIELD"; payload: SortField }
  | { type: "SET_SORT_ORDER"; payload: SortOrder }
  | { type: "SET_PAGE"; payload: number };