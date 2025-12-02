import { date, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createUpdateSchema } from "drizzle-zod";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email_id: varchar({ length: 255 }).notNull().unique(),
  username: varchar({ length: 255 }).unique(),
  country: varchar({ length: 3 }),
  created_at: timestamp().defaultNow().notNull(),
});

export type DBUserInsert = typeof usersTable.$inferInsert;
export type DBUser = typeof usersTable.$inferSelect;
export type DBUserUpdate = Partial<typeof usersTable.$inferInsert>;
export const UserUpdateSchema = createUpdateSchema(usersTable)

export const gameCodesTable = pgTable("game_codes", {
  id: varchar({ length: 3 }).primaryKey(),
  total_rounds: integer().notNull(),
  timer_per_round: integer().notNull(),
  difficulty: varchar({ length: 10 }),
});

export const scoresTable = pgTable("scores", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  total_score: integer().notNull(),
  username: varchar({ length: 255 })
    .notNull()
    .references(() => usersTable.username, { onDelete: "cascade", onUpdate: "cascade" }),
  game_code_id: varchar({ length: 3 }).references(() => gameCodesTable.id, { onDelete: "set null", onUpdate: "cascade" }),
  created_at: timestamp().defaultNow().notNull(),
  total_time: integer().notNull(),
  penalties: integer(),
});

export type NewDBScore = typeof scoresTable.$inferInsert;
export type DBScore = typeof scoresTable.$inferSelect;
