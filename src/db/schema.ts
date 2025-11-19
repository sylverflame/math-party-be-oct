import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email_id: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 255 }).unique(),
  country: varchar({ length: 3 }),
});
