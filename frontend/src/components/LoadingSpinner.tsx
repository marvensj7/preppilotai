export default function LoadingSpinner({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600"
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
