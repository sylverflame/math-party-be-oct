import { date, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email_id: varchar({ length: 255 }).notNull().unique(),
  username: varchar({ length: 255 }).unique(),
  country: varchar({ length: 3 }),
  created_at: date().defaultNow().notNull(),
});

export type NewUser = typeof usersTable.$inferInsert;

export const gameCodesTable = pgTable("game_codes", {
  id: varchar({ length: 3 }).primaryKey(),
  total_rounds: integer().notNull(),
  timer_per_round: integer().notNull(),
  difficulty: varchar({ length: 10 }),
});

export const scoresTable = pgTable("scores", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  total_score: integer().notNull(),
  user_id: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
  game_code_id: varchar({ length: 3 }).references(() => gameCodesTable.id, { onDelete: "set null", onUpdate: "cascade" }),
  created_at: date().defaultNow().notNull(),
  total_time: integer().notNull(),
  penalties: integer(),
});
