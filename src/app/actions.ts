"use server";

import { db } from "@/lib/db";
import { getRandomAnimationId } from "@/lib/animations";
import { revalidatePath } from "next/cache";

function toDateOnlyString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDateAtUtc(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function isHabitActiveOnDay(habit: { plans: { startDate: Date; endDate?: Date | null }[] }, dateString: string) {
  if (!habit.plans?.length) return true;

  const currentDate = buildDateAtUtc(dateString);

  return habit.plans.some((plan) => {
    const planStart = buildDateAtUtc(toDateOnlyString(plan.startDate));
    const planEnd = plan.endDate ? buildDateAtUtc(toDateOnlyString(plan.endDate)) : null;
    return currentDate >= planStart && (planEnd === null || currentDate <= planEnd);
  });
}

function getPlanLabel(habit: { plans: { durationDays?: number | null }[] }) {
  const plan = habit.plans?.[0];
  if (!plan) return "∞";
  if (plan.durationDays && plan.durationDays > 0) return `${plan.durationDays}d`;
  return "∞";
}

function buildRecentDayStrings(daysCount: number) {
   return Array.from({ length: daysCount }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

async function ensureDaysExist(dateStrings: string[]) {
  const payload = dateStrings.map((date) => ({ date: buildDateAtUtc(date) }));
  await db.day.createMany({ data: payload, skipDuplicates: true });
}

export async function toggleHabitInDay(habitSlug: string, dateStr: string) {
  const habit = await db.habit.findUnique({ where: { slug: habitSlug } });
  if (!habit) return;

  const day = await db.day.upsert({
    where: { date: buildDateAtUtc(dateStr) },
    update: {},
    create: { date: buildDateAtUtc(dateStr) },
  });

  const existingTask = await db.dayTask.findUnique({
    where: { dayId_habitId: { dayId: day.id, habitId: habit.id } },
  });

  if (existingTask) {
    await db.dayTask.delete({ where: { id: existingTask.id } });
  } else {
    await db.dayTask.create({
      data: {
        dayId: day.id,
        habitId: habit.id,
        animationType: getRandomAnimationId(),
        completedAt: new Date(),
      },
    });
  }

  revalidatePath("/");
}

export async function createHabit(title: string, slug: string, durationDaysParam: string) {
  if (!title.trim() || !slug.trim()) return;

  const existing = await db.habit.findUnique({ where: { slug } });
  if (existing) return;

  const durationDays = Number(durationDaysParam) || 0;
  const today = buildDateAtUtc(new Date().toISOString().slice(0, 10));
  const endDate = durationDays > 0
    ? buildDateAtUtc(new Date(today.getTime() + (durationDays - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
    : null;

  await db.habit.create({
    data: {
      title,
      slug,
      plans: {
        create: [
          {
            startDate: today,
            durationDays: durationDays > 0 ? durationDays : null,
            endDate,
            repeatType: "DAILY",
          },
        ],
      },
    },
  });

  revalidatePath("/");
}

export async function getFactoryGrid30Days() {
  const days = buildRecentDayStrings(30);
  await ensureDaysExist(days);

  const allHabits = await db.habit.findMany({ include: { plans: true } });
  const allTasks = await db.dayTask.findMany({
    where: { day: { date: { in: days.map(buildDateAtUtc) } } },
    include: { habit: true, day: true },
  });

  const taskMap = new Map<string, typeof allTasks[number]>();
  allTasks.forEach((task) => {
    const dateKey = toDateOnlyString(task.day.date);
    taskMap.set(`${dateKey}:${task.habitId}`, task);
  });

  return days.map((dateStr) => {
    const activeHabits = allHabits.filter((habit) => isHabitActiveOnDay(habit, dateStr));

    const habitsState = activeHabits.map((habit) => {
      const task = taskMap.get(`${dateStr}:${habit.id}`);
      return {
        title: habit.title,
        slug: habit.slug,
        isCompleted: !!task,
        animationId: task?.animationType ?? null,
        planLabel: getPlanLabel(habit),
      };
    });

    return {
      date: dateStr,
      habits: habitsState,
    };
  });
}

export async function getOverviewStats(daysCount = 30) {
  const days = buildRecentDayStrings(daysCount);
  const allHabits = await db.habit.findMany({ include: { plans: true } });
  const allTasks = await db.dayTask.findMany({
    where: { day: { date: { in: days.map(buildDateAtUtc) } } },
    include: { habit: true, day: true },
  });

  const completedTasks = allTasks.length;

  const activeHabitsByDay = days.map((date) =>
    allHabits.filter((habit) => isHabitActiveOnDay(habit, date)).length,
  );

  const totalPossibleTasks = activeHabitsByDay.reduce((sum, count) => sum + count, 0);
  const activeDays = activeHabitsByDay.filter((count) => count > 0).length;

  const habits = allHabits.map((habit) => ({
    title: habit.title,
    slug: habit.slug,
    planLabel: getPlanLabel(habit),
    completedTasks: allTasks.filter((task) => task.habitId === habit.id).length,
  }));

  return {
    totalDays: daysCount,
    totalHabits: allHabits.length,
    activeDays,
    totalPossibleTasks,
    completedTasks,
    completionRate: totalPossibleTasks ? Math.round((completedTasks / totalPossibleTasks) * 100) : 0,
    habits,
  };
}
