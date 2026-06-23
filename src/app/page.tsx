export const dynamic = "force-dynamic";

import { ANIMATIONS } from "@/lib/animations";
import {
  getFactoryGrid30Days,
  getOverviewStats,
  toggleHabitInDay,
  createHabit,
} from "./actions";

export default async function Home() {
  const [monthDays, stats] = await Promise.all([
    getFactoryGrid30Days(),
    getOverviewStats(),
  ]);
  const monthName = new Date().toLocaleString("ru-RU", { month: "long" });

  async function handleCreateHabit(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const duration = (formData.get("duration") as string) ?? "0";
    if (!title) return;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\sа-яё]/gi, "")
      .replace(/\s+/g, "-");

    await createHabit(title, slug, duration);
  }

  return (
    <main className="min-h-screen bg-[#08101f] text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-wider bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
            ИНТЕРАКТИВНАЯ ФАБРИКА ПРИВЫЧЕК ⚙️
          </h1>
          <p className="text-slate-300 text-sm">
            Таблица за {monthName} с 1-го по последний день месяца.
          </p>
        </header>

        <section className="bg-slate-900/95 border-2 border-slate-800/80 rounded-2xl p-6 shadow-[0_20px_80px_rgba(15,23,42,0.55)] max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-fuchsia-300 mb-4 flex items-center gap-2">
            🛠️ Добавление привычек с длительностью
          </h2>
          <form
            action={handleCreateHabit}
            className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3"
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="text"
                name="title"
                required
                maxLength={40}
                placeholder="Например: 💧 Выпить воды"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 transition"
              />
              <select
                name="duration"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-400 transition"
                defaultValue="0"
              >
                <option value="0">Без ограничений</option>
                <option value="7">7 дней</option>
                <option value="30">30 дней</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition duration-200"
            >
              + Добавить привычку
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold uppercase tracking-[0.25em] text-slate-300">
              {monthName}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {monthDays.map((day, index) => {
              const isDayComplete =
                day.habits.length > 0 &&
                day.habits.every((habit) => habit.isCompleted);
              const dayThemeClass = isDayComplete
                ? "bg-slate-900 border-emerald-400/70 hover:border-emerald-400/90 complete-day hover-lift"
                : "bg-slate-900 border-slate-800 hover:border-indigo-500/50";
              const debugCompleteClass = isDayComplete
                ? "ring-2 ring-emerald-400/10"
                : "";

              return (
                <div
                  key={day.date}
                  className={`border-2 rounded-2xl p-4 flex flex-col justify-between shadow-xl h-[360px] min-h-[360px] relative transition duration-300 overflow-hidden ${dayThemeClass} ${debugCompleteClass}`}
                >
                  <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      ДЕНЬ {index + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {day.date}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1 mt-1 overflow-y-auto max-h-[210px] pr-1">
                    {day.habits.map((habit) => {
                      return (
                        <div
                          key={`${day.date}-${habit.slug}`}
                          className="flex items-start justify-between min-h-[44px]"
                        >
                          {habit.isCompleted ? (
                            <form
                              action={async () => {
                                "use server";
                                await toggleHabitInDay(habit.slug, day.date);
                              }}
                              className="w-full"
                            >
                              <button
                                type="submit"
                                className="w-full h-full py-2.5 cursor-pointer text-left text-[9px] px-3 rounded-xl bg-emerald-950/95 border border-emerald-400/60 text-[9px] font-semibold text-emerald-100 shadow-[0_8px_24px_rgba(16,185,129,0.18)] hover:bg-emerald-900 hover:border-emerald-300 transition duration-200 whitespace-normal break-words"
                              >
                                <span className="inline-flex items-center gap-0.5">
                                  <span>✅</span>
                                  <span>{habit.title}</span>
                                </span>
                                <span className="ml-2 text-[9px] text-emerald-200">
                                  Выполнено
                                </span>
                              </button>
                            </form>
                          ) : (
                            <form
                              action={async () => {
                                "use server";
                                await toggleHabitInDay(habit.slug, day.date);
                              }}
                              className="w-full"
                            >
                              <button
                                type="submit"
                                className="w-full h-full py-2.5 cursor-pointer text-left text-[9px] px-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[9px] font-semibold text-slate-300 hover:text-white hover:bg-fuchsia-600 hover:border-fuchsia-500 transition duration-200 whitespace-normal break-words"
                              >
                                + {habit.title}
                                <span className="ml-1 text-[9px] text-slate-500">
                                  {habit.planLabel}
                                </span>
                              </button>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-[9px] text-right text-slate-600 font-mono mt-2">
                    Заселено: {day.habits.filter((h) => h.isCompleted).length} /{" "}
                    {day.habits.length}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-slate-900/95 border-2 border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-sky-300 mb-4">
            📊 Статистика за 30 дней
          </h2>
          <div className="grid gap-3 text-sm">
            <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-700">
              <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">
                Выполнено
              </p>
              <p className="text-white text-2xl font-semibold">
                {stats.completedTasks}
              </p>
              <p className="text-slate-500 text-[11px] mt-1">
                из {stats.totalPossibleTasks} возможных
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-700">
              <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">
                Процент выполнения
              </p>
              <p className="text-white text-2xl font-semibold">
                {stats.completionRate}%
              </p>
              <p className="text-slate-500 text-[11px] mt-1">
                за {stats.totalDays} дней
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-700">
              <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">
                Активные дни
              </p>
              <p className="text-white text-2xl font-semibold">
                {stats.activeDays}
              </p>
              <p className="text-slate-500 text-[11px] mt-1">
                дней, в которых были привычки
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-700">
              <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">
                Привычек
              </p>
              <p className="text-white text-2xl font-semibold">
                {stats.totalHabits}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-sky-300">Привычки</h3>
            {stats.habits.map((habit) => (
              <div
                key={habit.slug}
                className="flex items-center justify-between rounded-2xl bg-slate-950/80 border border-slate-700 px-4 py-3 text-[12px] text-slate-300"
              >
                <div>
                  <div className="font-medium text-white">{habit.title}</div>
                  <div className="text-slate-500">{habit.planLabel}</div>
                </div>
                <div className="font-semibold text-emerald-300">
                  {habit.completedTasks}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
