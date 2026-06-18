import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const defaultHabits = [
    { title: '🤸‍♂️ Зарядка', slug: 'charging' },
    { title: '🏋️‍♂️ Спорт', slug: 'sport' },
    { title: '📚 Почитать', slug: 'reading' },
  ]

  for (const habit of defaultHabits) {
    const createdHabit = await prisma.habit.upsert({
      where: { slug: habit.slug },
      update: { title: habit.title },
      create: {
        title: habit.title,
        slug: habit.slug,
        plans: {
          create: [{ repeatType: 'DAILY' }],
        },
      },
    })

    const plansCount = await prisma.habitPlan.count({ where: { habitId: createdHabit.id } })
    if (plansCount === 0) {
      await prisma.habitPlan.create({
        data: {
          habitId: createdHabit.id,
          repeatType: 'DAILY',
        },
      })
    }
  }

  console.log('Базовые привычки и планы успешно созданы!')
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })

  