export default function LoadingSpinner({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      {/* Spinner rings */}
      <div className="relative h-16 w-16">
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: "3px solid transparent",
            borderTopColor: "#22c55e",
            borderRightColor: "#06b6d4",
          }}
        />
        <div
          className="absolute inset-2 rounded-full animate-spin"
          style={{
            border: "2px solid transparent",
            borderBottomColor: "rgba(34,197,94,0.4)",
            animationDirection: "reverse",
            animationDuration: "0.8s",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">🥗</span>
        </div>
      </div>

      <div className="text-center">
        <p
          className="text-sm font-medium"
          style={{
            background: "linear-gradient(135deg, #22c55e, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {message}
        </p>
        <p className="mt-1 text-xs text-slate-600">This usually takes 10–20 seconds</p>
      </div>
    </div>
  );
}
