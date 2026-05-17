export function formatApiError(error: any, fallback?: string) {
  const detail = error?.response?.data?.detail ?? error?.message ?? error;

  if (typeof detail === "string") return detail;

  if (detail && typeof detail === "object") {
    if (typeof detail.message === "string") return detail.message;
    try {
      return JSON.stringify(detail);
    } catch (e) {
      return String(detail);
    }
  }

  return fallback || "An error occurred";
}
