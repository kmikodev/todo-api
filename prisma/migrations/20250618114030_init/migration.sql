-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_audits" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_completed_idx" ON "tasks"("completed");

-- CreateIndex
CREATE INDEX "tasks_priority_idx" ON "tasks"("priority");

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");

-- CreateIndex
CREATE INDEX "tasks_created_at_idx" ON "tasks"("created_at");

-- CreateIndex
CREATE INDEX "tasks_title_idx" ON "tasks"("title");

-- CreateIndex
CREATE INDEX "tasks_completed_priority_idx" ON "tasks"("completed", "priority");

-- CreateIndex
CREATE INDEX "tasks_due_date_completed_idx" ON "tasks"("due_date", "completed");

-- CreateIndex
CREATE INDEX "task_audits_task_id_idx" ON "task_audits"("task_id");

-- CreateIndex
CREATE INDEX "task_audits_timestamp_idx" ON "task_audits"("timestamp");
