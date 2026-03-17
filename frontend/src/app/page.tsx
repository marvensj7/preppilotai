import GeneratePlanForm from "@/components/GeneratePlanForm";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 16px 64px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#f5f5f5",
              margin: 0,
              lineHeight: 1,
            }}
          >
            ⚡ PrepPilotAI
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#888888",
              marginTop: 8,
              fontWeight: 400,
            }}
          >
            Precision nutrition. Built for performance.
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: 24 }}>
          <GeneratePlanForm />
        </div>

        {/* Footer note */}
        <p
          style={{
            fontSize: 11,
            color: "#333",
            marginTop: 16,
            letterSpacing: "0.04em",
            textAlign: "center",
          }}
        >
          POWERED BY CLAUDE AI · PLANS SAVED BY LINK
        </p>
      </div>
    </main>
  );
}
