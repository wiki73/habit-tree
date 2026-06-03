export const dynamic = 'force-dynamic';

import { ANIMATIONS } from "@/lib/animations";
import { getFactoryGrid30Days, toggleHabitInDay } from "./actions";

export default async function Home() {
  const grid30Days = await getFactoryGrid30Days();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
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

        {/* Главная Сетка 30 Дней */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
              <div className="flex-grow flex flex-col justify-center space-y-2.5 my-2">
                {day.habits.map((habit) => {
                  // Если привычка выполнена, ищем анимацию в конфиге
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
                          className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/30 w-full px-3 py-1.5 rounded-xl cursor-pointer hover:bg-red-950/30 hover:border-red-500/30 transition group relative"
                          title="Нажмите, чтобы отменить выполнение"
                        >
                          <span
                            className={`text-xl ${animInfo.tailwindClass} inline-block z-10`}
                          >
                            {animInfo.icon}
                          </span>

                          {/* Текст привычки: скрывается при наведении строго на ЭТУ строку */}
                          <span className="text-[11px] text-indigo-300 font-medium group-hover:hidden z-10 truncate">
                            {habit.title.split(" ")[1]}{" "}
                            {animInfo.label.toLowerCase()}!
                          </span>

                          {/* Текст отмены: появляется строго при наведении на ЭТУ строку */}
                          <span className="text-[11px] text-red-400 font-bold hidden group-hover:inline z-10">
                            Убрать Х
                          </span>

                          {/* Скрытая форма: теперь она растягивается строго ВНУТРИ этой строки (inset-0 + relative выше) */}
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
                        // Если привычка не выполнена — показываем кнопку выполнения
                        <form
                          action={async () => {
                            "use server";
                            await toggleHabitInDay(habit.slug, day.date);
                          }}
                          className="w-full"
                        >
                          <button
                            type="submit"
                            className="w-full text-left px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition duration-200"
                          >
                            + Выполнить {habit.title}
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Индикатор заполненности комнаты */}
              <div className="text-[9px] text-right text-slate-600 font-mono mt-2">
                Заселено: {day.habits.filter((h) => h.isCompleted).length} / 3
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
