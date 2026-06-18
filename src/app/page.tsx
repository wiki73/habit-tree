export const dynamic = "force-dynamic";

import { ANIMATIONS } from "@/lib/animations";
import {
  getFactoryGrid30Days,
  getOverviewStats,
  toggleHabitInDay,
  createHabit,
} from "./actions";

export default async function Home() {
  const [grid30Days, stats] = await Promise.all([
    getFactoryGrid30Days(),
    getOverviewStats(30),
  ]);

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
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            ИНТЕРАКТИВНАЯ ФАБРИКА ПРИВЫЧЕК ⚙️
          </h1>
          <p className="text-slate-400 text-sm">
            Каждый день теперь отдельная сущность, а задачи могут быть
            ограничены 7, 30 днями или идти без срока.
          </p>
        </header>

        <section className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
              <select
                name="duration"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                defaultValue="0"
              >
                <option value="0">Без ограничений</option>
                <option value="7">7 дней</option>
                <option value="30">30 дней</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition duration-200"
            >
              + Добавить привычку
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {grid30Days.map((day, index) => {
              const isDayComplete = day.habits.length > 0 && day.habits.every((habit) => habit.isCompleted);
              const animationClass = isDayComplete ? `animate-wobble ${index % 2 === 0 ? '' : 'animate-wobble-reverse'}` : '';
              const debugCompleteClass = isDayComplete ? 'ring-2 ring-indigo-500/25' : '';

              return (
                <div
                  key={day.date}
                  className={`bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl min-h-[260px] relative hover:border-indigo-500/50 transition duration-300 ${animationClass} ${debugCompleteClass}`}
                >
                  <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">ДЕНЬ {index + 1}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{day.date}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 my-2">
                    {day.habits.map((habit) => {
                      const animInfo = habit.isCompleted ? ANIMATIONS.find((a) => a.id === habit.animationId) : null;
                      return (
                        <div key={`${day.date}-${habit.slug}`} className="flex items-center justify-between min-h-[44px]">
                          {habit.isCompleted && animInfo ? (
                            <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/30 w-full px-1 py-1.5 rounded-xl cursor-pointer hover:bg-red-950/30 hover:border-red-500/30 transition group relative" title="Нажмите, чтобы отменить выполнение">
                              <span className={`text-xl ${animInfo.tailwindClass} inline-block z-10`}>{animInfo.icon}</span>
                              <span className="text-[10px] text-indigo-300 font-medium group-hover:hidden z-10 truncate">{habit.title} {animInfo.label.toLowerCase()}!</span>
                              <span className="text-[11px] text-red-400 font-bold hidden group-hover:inline z-10">Убрать X</span>
                              <form action={async () => { "use server"; await toggleHabitInDay(habit.slug, day.date); }} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20">
                                <button type="submit" className="w-full h-full cursor-pointer" />
                              </form>
                            </div>
                          ) : (
                            <form action={async () => { "use server"; await toggleHabitInDay(habit.slug, day.date); }} className="w-full">
                              <button type="submit" className="w-full h-full py-3 cursor-pointer text-left text-xs px-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition duration-200 truncate">
                                + {habit.title}
                                <span className="ml-1 text-[10px] text-slate-500">{habit.planLabel}</span>
                              </button>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-[9px] text-right text-slate-600 font-mono mt-2">Заселено: {day.habits.filter((h) => h.isCompleted).length} / {day.habits.length}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-cyan-400 mb-4">
            📊 Статистика за 30 дней
          </h2>
            <div className="grid gap-3 text-sm">
              <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800">
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

              <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800">
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

              <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800">
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

              <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800">
                <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">
                  Привычек
                </p>
                <p className="text-white text-2xl font-semibold">
                  {stats.totalHabits}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">Привычки</h3>
              {stats.habits.map((habit) => (
                <div
                  key={habit.slug}
                  className="flex items-center justify-between rounded-2xl bg-slate-950/70 border border-slate-800 px-4 py-3 text-[12px] text-slate-300"
                >
                  <div>
                    <div className="font-medium">{habit.title}</div>
                    <div className="text-slate-500">{habit.planLabel}</div>
                  </div>
                  <div className="font-semibold text-slate-100">
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
