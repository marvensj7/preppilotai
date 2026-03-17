import type { Meal } from "@/types/meal-plan";
import MacroBadge from "./MacroBadge";

interface MealCardProps {
  meal: Meal;
  index: number;
}

const MEAL_ICONS = ["🌅", "🥗", "🍎", "🍽️", "🌙"];

export default function MealCard({ meal, index }: MealCardProps) {
  const icon = MEAL_ICONS[index % MEAL_ICONS.length];

  return (
    <article className="meal-card overflow-hidden">
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{
          background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(6,182,212,0.08) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          {icon}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Meal {index + 1}
          </p>
          <h3 className="font-bold text-white leading-snug">{meal.name}</h3>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-5">
        <MacroBadge macros={meal.macros} />

        <div>
          <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Ingredients
          </h4>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {meal.ingredients.map((ingredient) => (
              <li key={ingredient} className="flex items-start gap-2 text-sm text-slate-300">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "linear-gradient(135deg, #22c55e, #06b6d4)" }}
                />
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Preparation
          </h4>
          <p className="text-sm leading-relaxed text-slate-400">{meal.prep}</p>
        </div>
      </div>
    </article>
  );
}
