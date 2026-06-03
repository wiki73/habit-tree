export const dynamic = "force-dynamic";

import { ANIMATIONS } from "@/lib/animations";
import { getFactoryGrid30Days, toggleHabitInDay, createHabit } from "./actions";

export default async function Home() {
  const grid30Days = await getFactoryGrid30Days();

  // Функция-обработчик для формы добавления новой привычки
  async function handleCreateHabit(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    if (!title) return;

    // Автоматически генерируем уникальный slug из названия (транслит или просто очистка)
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\sа-яё]/gi, "") // удаляем спецсимволы
      .replace(/\s+/g, "-"); // заменяем пробелы на дефисы

    await createHabit(title, slug);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Шапка */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            ИНТЕРАКТИВНАЯ ФАБРИКА ПРИВЫЧЕК ⚙️
          </h1>
          <p className="text-slate-400 text-sm">
            Каждая ячейка — это день. Закрывай привычки, чтобы заселить комнату
            случайными рабочими!
          </p>
        </header>

        {/* Добавление привычек */}
        <section className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl max-w-xl mx-auto">
          <h2 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
            🛠️ Добавление привычек
          </h2>
          <form action={handleCreateHabit} className="flex gap-3">
            <input
              type="text"
              name="title"
              required
              maxLength={25}
              placeholder="Например: 💧 Выпить воды (незабудьте смайлик😊)"
              className="flex-grow bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition duration-200"
            >
              + Добавить
            </button>
          </form>
          
        </section>

        {/* Главная Сетка 30 Дней */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {grid30Days.map((day, index) => (
            <div
              key={day.date}
              className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl min-h-[220px] relative hover:border-indigo-500/50 transition duration-300"
            >
              {/* Хедер ячейки (Номер дня и дата) */}
              <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-1.5">
                <span className="text-xs font-mono font-bold text-indigo-400">
                  ДЕНЬ {index + 1}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {day.date}
                </span>
              </div>

              {/* Внутреннее пространство комнаты-дня */}
              <div className="grid grid-cols-2 gap-1 space-y-0.5 my-2">
                {day.habits.map((habit) => {
                  const animInfo = habit.isCompleted
                    ? ANIMATIONS.find((a) => a.id === habit.animationId)
                    : null;

                  return (
                    <div
                      key={habit.slug}
                      className="flex items-center justify-between min-h-[36px]"
                    >
                      {habit.isCompleted && animInfo ? (
                        <div
                          className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/30 w-full px-1 py-1.5 rounded-xl cursor-pointer hover:bg-red-950/30 hover:border-red-500/30 transition group relative"
                          title="Нажмите, чтобы отменить выполнение"
                        >
                          <span
                            className={`text-xl ${animInfo.tailwindClass} inline-block z-10`}
                          >
                            {animInfo.icon}
                          </span>
                          <span className="text-[10px] text-indigo-300 font-medium group-hover:hidden z-10 truncate">
                            {habit.title} {animInfo.label.toLowerCase()}!
                          </span>
                          <span className="text-[11px] text-red-400 font-bold hidden group-hover:inline z-10">
                            Убрать Х
                          </span>
                          <form
                            action={async () => {
                              "use server";
                              await toggleHabitInDay(habit.slug, day.date);
                            }}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                          >
                            <button
                              type="submit"
                              className="w-full h-full cursor-pointer"
                            />
                          </form>
                        </div>
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
                            className="w-full h-full py-3 cursor-pointer text-left text-xs px-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition duration-200 truncate"
                          >
                            + {habit.title}
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Индикатор заполненности комнаты */}
              <div className="text-[9px] text-right text-slate-600 font-mono mt-2">
                Заселено: {day.habits.filter((h) => h.isCompleted).length} /{" "}
                {day.habits.length}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
