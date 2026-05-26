import axios from 'axios';

/** Dedicated client for login — no auth interceptors (fastest path). */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});
