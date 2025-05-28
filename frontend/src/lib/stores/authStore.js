import { writable } from "svelte/store";

// Stores user data if authenticated, null otherwise
export const user = writable(null);
// Stores loading state for auth check
export const isLoadingAuth = writable(true);
// Stores any auth-related errors
export const authError = writable(null);
