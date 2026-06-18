/*
  Warnings:

  - You are about to drop the `HabitLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RepeatType" AS ENUM ('DAILY', 'WEEKLY', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "HabitLog" DROP CONSTRAINT "HabitLog_habitId_fkey";

-- DropTable
DROP TABLE "HabitLog";

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayTask" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT true,
    "animationType" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DayTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitPlan" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "startDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATE,
    "repeatType" "RepeatType" NOT NULL DEFAULT 'DAILY',
    "durationDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HabitPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Day_date_key" ON "Day"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DayTask_dayId_habitId_key" ON "DayTask"("dayId", "habitId");

-- AddForeignKey
ALTER TABLE "DayTask" ADD CONSTRAINT "DayTask_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayTask" ADD CONSTRAINT "DayTask_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitPlan" ADD CONSTRAINT "HabitPlan_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
