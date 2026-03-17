import type { Meal } from "@/types/meal-plan";
import MacroBadge from "./MacroBadge";

interface MealCardProps {
  meal: Meal;
  index: number;
}

export default function MealCard({ meal, index }: MealCardProps) {
  return (
    <article className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
      <div className="bg-brand-600 px-5 py-3 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
          {index + 1}
        </span>
        <h3 className="font-semibold text-white text-lg leading-snug">{meal.name}</h3>
      </div>

      <div className="p-5 space-y-4">
        <MacroBadge macros={meal.macros} />

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Ingredients
          </h4>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {meal.ingredients.map((ingredient) => (
              <li key={ingredient} className="flex items-start gap-1.5 text-sm text-gray-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Preparation
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">{meal.prep}</p>
        </div>
      </div>
    </article>
  );
}
