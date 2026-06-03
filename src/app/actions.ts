"use server";

import { db } from "@/lib/db";
import { getRandomAnimationId } from "@/lib/animations";
import { revalidatePath } from "next/cache";

// Клик по кнопке привычки внутри ячейки дня
export async function toggleHabitInDay(habitSlug: string, dateStr: string) {
  // Находим саму привычку
  const habit = await db.habit.findUnique({ where: { slug: habitSlug } });
  if (!habit) return;

  // Проверяем, отмечена ли она уже в этот день
  const existingLog = await db.habitLog.findUnique({
    where: { habitId_date: { habitId: habit.id, date: dateStr } },
  });

  if (existingLog) {
    // Если уже была — удаляем (отменяем выполнение)
    await db.habitLog.delete({ where: { id: existingLog.id } });
  } else {
    // Если выполняем впервые — генерируем СЛУЧАЙНОГО челика!
    await db.habitLog.create({
      data: {
        habitId: habit.id,
        date: dateStr,
        animationType: getRandomAnimationId(), // Рандомный ID анимации
      },
    });
  }

  revalidatePath("/");
}

// Собираем полную сетку 30 дней со всеми кнопками и заспавненными челиками
export async function getFactoryGrid30Days() {
  // Получаем список 30 дней (от старых к сегодня)
  const days = Array.from({ length: 30 })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

  // Достаем все привычки и все логи за эти 30 дней
  const allHabits = await db.habit.findMany();
  const allLogs = await db.habitLog.findMany({
    where: { date: { in: days } },
    include: { habit: true },
  });

  // Для каждого дня собираем состояние его "комнаты"
  return days.map((dateStr) => {
    const logsThisDay = allLogs.filter((log) => log.date === dateStr);

    // Массив привычек с их статусом для этого конкретного дня
    const habitsState = allHabits.map((habit) => {
      const logForThisHabit = logsThisDay.find((l) => l.habitId === habit.id);
      return {
        title: habit.title,
        slug: habit.slug,
        isCompleted: !!logForThisHabit,
        animationId: logForThisHabit ? logForThisHabit.animationType : null,
      };
    });

    return {
      date: dateStr,
      habits: habitsState,
    };
  });
}
