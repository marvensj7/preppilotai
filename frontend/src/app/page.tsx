import GeneratePlanForm from "@/components/GeneratePlanForm";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Floating food emoji background */}
      <div className="food-pattern select-none" aria-hidden="true">
        <span className="emoji-float absolute text-4xl opacity-10" style={{ top: "8%", left: "5%" }}>🥦</span>
        <span className="emoji-float-reverse absolute text-3xl opacity-10" style={{ top: "15%", right: "8%" }}>🍗</span>
        <span className="emoji-float-slow absolute text-5xl opacity-10" style={{ top: "35%", left: "2%" }}>🥑</span>
        <span className="emoji-float absolute text-3xl opacity-10" style={{ top: "55%", right: "4%" }}>🍳</span>
        <span className="emoji-float-reverse absolute text-4xl opacity-10" style={{ top: "70%", left: "6%" }}>🫐</span>
        <span className="emoji-float-slow absolute text-3xl opacity-10" style={{ top: "80%", right: "10%" }}>🥕</span>
        <span className="emoji-float absolute text-2xl opacity-10" style={{ top: "25%", left: "88%" }}>🍋</span>
        <span className="emoji-float-reverse absolute text-4xl opacity-10" style={{ top: "45%", left: "92%" }}>🥩</span>
        <span className="emoji-float-slow absolute text-3xl opacity-10" style={{ top: "88%", left: "50%" }}>🫙</span>
        <span className="emoji-float absolute text-2xl opacity-10" style={{ top: "5%", left: "55%" }}>🌿</span>
      </div>

      {/* Glow orbs */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: "600px",
            height: "600px",
            top: "-200px",
            left: "-200px",
            background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
            animation: "glowPulse 4s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "500px",
            height: "500px",
            bottom: "-150px",
            right: "-150px",
            background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
            animation: "glowPulse 5s ease-in-out infinite 1s",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-lg px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="mb-10 text-center">
          {/* Icon */}
          <div className="relative mx-auto mb-6 w-fit">
            <div
              className="absolute inset-0 rounded-2xl blur-xl"
              style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.4), rgba(6,182,212,0.4))" }}
              aria-hidden="true"
            />
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, #22c55e, #06b6d4)" }}
            >
              <span className="text-4xl" role="img" aria-label="salad">🥗</span>
            </div>
          </div>

          {/* Title with animated glow */}
          <div className="relative mb-3">
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto h-16 w-64 blur-3xl"
              style={{
                background: "linear-gradient(90deg, rgba(34,197,94,0.25), rgba(6,182,212,0.25))",
                animation: "glowPulse 3s ease-in-out infinite",
              }}
              aria-hidden="true"
            />
            <h1
              className="relative text-5xl font-black tracking-tight sm:text-6xl"
              style={{
                background: "linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              PrepPilotAI
            </h1>
          </div>

          <p className="text-base text-slate-400 leading-relaxed">
            Tell us your goals — Claude AI builds a full day of meals,
            <br className="hidden sm:block" /> macros &amp; a shopping list in seconds.
          </p>
        </div>

        {/* Frosted glass form card */}
        <div className="glass-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.4))" }}
            />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Your Preferences
            </h2>
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(90deg, rgba(6,182,212,0.4), transparent)" }}
            />
          </div>
          <GeneratePlanForm />
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Powered by Claude AI · Plans saved &amp; shareable by link
        </p>
      </div>
    </main>
  );
}
