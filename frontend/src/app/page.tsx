import GeneratePlanForm from "@/components/GeneratePlanForm";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-md">
          <span className="text-3xl" role="img" aria-label="salad">
            🥗
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">PrepPilotAI</h1>
        <p className="mt-2 text-gray-500">
          Tell us your goals — we&apos;ll generate a full day of meals, macros, and a shopping list
          powered by Claude AI.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
        <h2 className="mb-6 text-lg font-semibold text-gray-800">Your Preferences</h2>
        <GeneratePlanForm />
      </div>
    </main>
  );
}
