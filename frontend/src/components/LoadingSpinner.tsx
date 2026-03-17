export default function LoadingSpinner({ message = "Loading…" }: { message?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "48px 0",
      }}
    >
      {/* Minimal spinner */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid #1e1e1e",
          borderTopColor: "#c0c0c0",
          animation: "spin 0.8s linear infinite",
        }}
        role="status"
        aria-label="Loading"
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#888", margin: 0 }}>{message}</p>
        <p style={{ fontSize: 11, color: "#444", margin: "4px 0 0" }}>
          Typically 10–20 seconds
        </p>
      </div>
    </div>
  );
}
