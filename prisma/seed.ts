import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const defaultHabits = [
    { title: '🤸‍♂️ Зарядка', slug: 'charging' },
    { title: '🏋️‍♂️ Спорт', slug: 'sport' },
    { title: '📚 Почитать', slug: 'reading' },
  ]

  for (const habit of defaultHabits) {
    await prisma.habit.upsert({
      where: { slug: habit.slug },
      update: {},
      create: habit,
    })
  }
  console.log('Базовые привычки успешно созданы!')
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })

  